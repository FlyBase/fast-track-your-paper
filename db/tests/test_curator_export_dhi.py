import importlib.util,json,os,subprocess,tempfile,time
from pathlib import Path
from unittest.mock import patch
import shutil
assert os.geteuid()==0, 'Run this bounded synthetic fixture as root'
os.umask(0o077)
base=Path(os.environ['FTYP_EXPORT_TEST_EVIDENCE']).absolute()
assert not base.exists(), 'Use a fresh evidence directory'
assert base.parent==Path('/data/ctabone/flybase/software_update/build/hardening-campaign-20261019/lead'), 'Use reserved private evidence root'
for ancestor in base.parents:
 assert not ancestor.is_symlink(), 'No symlink evidence ancestors'
assert base.parent.stat().st_mode & 0o077 == 0, 'Private evidence parent required'
ids=subprocess.check_output(['docker','ps','-aq'],text=True,timeout=10).split()
for item in json.loads(subprocess.check_output(['docker','inspect',*ids],timeout=10)) if ids else []:
 for mount in item.get('Mounts',[]):
  if mount.get('Source'):
   source=Path(mount['Source']).resolve()
   assert source!=base and source not in base.parents and base not in source.parents, 'Retained mount overlap'
   for endpoint, other in ((source,base),(base,source)):
    for ancestor in (other,*other.parents):
     try: assert not endpoint.samefile(ancestor), 'Retained mount inode alias'
     except FileNotFoundError: pass
base.mkdir(mode=0o700)
name='dhi-test-ftyp-export-'+str(os.getpid())
image='sha256:1123b53147234eaffcf729c4c4606c5e60f1e0fe5ae2633c96ee9aa6f26f3474'
uid=70
run=subprocess.run
def floors():
 available=int(next(x.split()[1] for x in Path('/proc/meminfo').read_text().splitlines() if x.startswith('MemAvailable:')))*1024
 assert available>=6*1024**3 and shutil.disk_usage(base).free>=150*1024**3, 'Resource floor'
floors()
data=base/'data';data.mkdir(mode=0o700);os.chown(data,uid,uid)
secret=base/'export.pgpass';secret.write_text('127.0.0.1:5432:ftyp:ftyp_export_login:synthetic-export-only\n')
seed=base/'admin.pass';seed.write_text('synthetic-admin-only\n')
for path in (secret,seed):os.chown(path,uid,uid);path.chmod(0o600)
cmd=['docker','run','-d','--pull','never','--name',name,'--network','none','--read-only',
 '--label','org.flybase.ftyp.export-fixture='+name,
 '--user',str(uid)+':'+str(uid),'--memory','512m','--memory-swap','512m','--cpus','1','--pids-limit','128',
 '--security-opt','no-new-privileges','--cap-drop','ALL','--restart','no',
 '--tmpfs','/var/run/postgresql:uid=70,gid=70,mode=700,size=16m',
 '--tmpfs','/tmp:uid=70,gid=70,mode=700,size=32m',
 '--mount','type=bind,src='+str(data)+',dst=/var/lib/postgresql',
 '-v',str(secret)+':/run/secrets/ftyp_export_pgpass:ro',
 '-v',str(seed)+':/run/secrets/init-password:ro','-e','PGHOST=/var/run/postgresql',
 '--entrypoint','sh',image,'-ec',
 'initdb -D /var/lib/postgresql --username=postgres --encoding=UTF8 --locale=C --auth-local=peer --auth-host=scram-sha-256 --pwfile=/run/secrets/init-password >/tmp/init.log; exec postgres -D /var/lib/postgresql -h 127.0.0.1 -k /var/run/postgresql']
cid=run(cmd,check=True,capture_output=True,text=True,timeout=30).stdout.strip()
(base/'native-container-id.txt').write_text(cid+'\n')
def admin(sql):
 r=run(['docker','exec','--user','postgres','-i',name,'psql','-X','-q','-w',
        '-U','postgres','-d','ftyp','-At','-v','ON_ERROR_STOP=1','-f','-'],
        input=sql.encode(),capture_output=True,timeout=15)
 if r.returncode:raise RuntimeError('Native fixture SQL failed: '+r.stderr.decode()[:1000])
 return r.stdout.decode().strip()
try:
 for _ in range(40):
  r=run(['docker','exec',name,'pg_isready','-h','127.0.0.1','-U','postgres','-d','ftyp'],capture_output=True)
  if r.returncode==0:break
  time.sleep(.5)
 else:raise RuntimeError('Fixture startup failed')
 run(['docker','exec','--user','postgres',cid,'createdb','-U','postgres','ftyp'],check=True,capture_output=True,timeout=10)
 admin("""CREATE SCHEMA ftyp_hidden;
 CREATE TABLE ftyp_hidden.submissions (
 submission_id integer PRIMARY KEY,
 fbrf character varying,
 submitted_to_flybase timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
 date_processed timestamp with time zone,
 user_data jsonb DEFAULT '{}'::jsonb NOT NULL,
 CONSTRAINT fbrf_must_be_valid CHECK (fbrf ~ '^FBrf[0-9]+$'));
 """)
 admin((Path(__file__).resolve().parents[1]/'scripts/curator_export_role.sql').read_text())
 admin("ALTER ROLE ftyp_export_login PASSWORD 'synthetic-export-only';")
 spec=importlib.util.spec_from_file_location('exporter',Path(__file__).resolve().parents[1]/'scripts/deliver_submissions.py')
 m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
 checks=[]
 def case(label,mode):
  floors()
  admin("""TRUNCATE ftyp_hidden.submissions;
  INSERT INTO ftyp_hidden.submissions (submission_id,fbrf,user_data)
  VALUES (1,'FBrf0000001','{"text":"synthetic ordinary record"}');
  """)
  if mode=='empty':admin('DELETE FROM ftyp_hidden.submissions;')
  exported=[]
  def hooked(cmd,**kw):
   if cmd[0]=='docker':return run(cmd,**kw)
   if cmd[0]=='aws':
    raw=Path(cmd[-2]).read_bytes();exported.append(json.loads(raw) if raw else b'')
    if mode=='change':admin("""UPDATE ftyp_hidden.submissions SET user_data='{"text":"edited"}' WHERE submission_id=1;""")
    if mode=='insert':admin("INSERT INTO ftyp_hidden.submissions (submission_id,fbrf) VALUES (2,'FBrf0000002');")
    return subprocess.CompletedProcess(cmd,1 if mode=='fail' else 0,b'',b'')
   raise RuntimeError('Unexpected subprocess')
  with tempfile.TemporaryDirectory(dir=base) as spool:
   failed=False
   with patch.object(m.subprocess,'run',hooked):
    try:result=m.deliver(name,'weds',spool)
    except RuntimeError:failed=True
   assert failed==(mode in ('fail','change')),label
   processed=admin("SELECT count(*) FROM ftyp_hidden.submissions WHERE date_processed IS NOT NULL;")
   assert processed==('1' if mode in ('success','insert') else '0'),label
   if mode=='insert':assert admin("SELECT date_processed IS NULL FROM ftyp_hidden.submissions WHERE submission_id=2;")=='t'
   if mode=='empty':assert exported==[b'']
   else:assert set(exported[0][0])=={'submission_id','fbrf','submitted_to_flybase','date_processed','user_data'}
   if mode=='success':
    assert result['acknowledged_rows']==1
   checks.append(label)
 for label,mode in [('native-full-row-delivery','success'),('failed-upload-no-ack','fail'),
                    ('edited-row-not-acknowledged','change'),('new-row-not-acknowledged','insert'),
                    ('empty-zero-byte-file','empty')]:case(label,mode)
 for target in ('DATABASE ftyp','TABLE ftyp_hidden.submissions'):
  admin('ALTER '+target+' OWNER TO ftyp_export_login;')
  def only_database(cmd,**kw):
   assert cmd[0]=='docker','Owner guard must stop before upload'
   return run(cmd,**kw)
  with tempfile.TemporaryDirectory(dir=base) as spool:
   rejected=False
   with patch.object(m.subprocess,'run',only_database):
    try:m.deliver(name,'weds',spool)
    except RuntimeError as error:
     assert str(error)=='Export requires its restricted login role'
     rejected=True
   assert rejected
  admin('ALTER '+target+' OWNER TO postgres;')
  checks.append(target+' owner rejected')
 (base/'native-result.json').write_text(json.dumps({'pass':True,'checks':checks,
  'image':image,'container_id':cid,'network':'none','real_submissions_used':False,
  's3_used':False,'auth':'loopback SCRAM; mounted synthetic pgpass'},indent=2)+'\n')
 print(json.dumps({'pass':True,'native_checks':len(checks)}))
finally:
 logs=run(['docker','logs',cid],capture_output=True,timeout=10)
 (base/'private-server.log').write_bytes(logs.stdout+logs.stderr)
 actual=json.loads(run(['docker','inspect',cid],check=True,capture_output=True,text=True,timeout=10).stdout)[0]
 assert actual['Id']==cid and actual['Image']==image and actual['Config']['Labels']['org.flybase.ftyp.export-fixture']==name
 if actual['State']['Running']:run(['docker','stop','-t','30',cid],check=True,capture_output=True,timeout=40)
 run(['docker','rm',cid],check=True,capture_output=True,timeout=15)
 (base/'native-cleanup.json').write_text(json.dumps({'removed_owned_container':cid,'private_data_retained':True})+'\n')
