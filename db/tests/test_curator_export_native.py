import importlib.util,json,os,subprocess,tempfile,time
from pathlib import Path
from unittest.mock import patch
base=Path(os.environ['FTYP_EXPORT_TEST_EVIDENCE']);base.mkdir(parents=True,exist_ok=True)
name='recovery-ftyp-export-native-'+str(os.getpid())
image='sha256:5f71c21b69a7977b82247582e2e731ed76bdebaadb7dd7945ed76bcc9ed06632'
run=subprocess.run
os.umask(0o077)
fd,secret_name=tempfile.mkstemp(prefix='fixture-pgpass-',dir=base)
os.close(fd)
secret=Path(secret_name)
secret.write_text('127.0.0.1:5432:ftyp:ftyp_export_login:synthetic-export-only\n')
run(['sudo','chown','999:999',str(secret)],check=True)
run(['sudo','chmod','400',str(secret)],check=True)
cmd=['sudo','docker','run','-d','--name',name,'--network','none','--read-only',
 '--user','999:999','--memory','512m','--cpus','1','--pids-limit','128',
 '--security-opt','no-new-privileges','--cap-drop','ALL',
 '--tmpfs','/var/lib/postgresql/data:uid=999,gid=999,mode=700',
 '--tmpfs','/var/run/postgresql:uid=999,gid=999,mode=700',
 '--tmpfs','/tmp:uid=999,gid=999,mode=700',
 '-v',str(secret)+':/run/secrets/ftyp_export_pgpass:ro',
 '-e','POSTGRES_DB=ftyp','-e','POSTGRES_PASSWORD=synthetic-admin-only',
 '-e','POSTGRES_INITDB_ARGS=--auth-host=scram-sha-256',image]
cid=run(cmd,check=True,capture_output=True,text=True).stdout.strip()
(base/'native-container-id.txt').write_text(cid+'\n')
def admin(sql):
 r=run(['sudo','docker','exec','--user','999:999','-i',name,'psql','-X','-q','-w',
        '-U','postgres','-d','ftyp','-At','-v','ON_ERROR_STOP=1','-f','-'],
        input=sql.encode(),capture_output=True)
 if r.returncode:raise RuntimeError('Native fixture SQL failed: '+r.stderr.decode()[:1000])
 return r.stdout.decode().strip()
try:
 for _ in range(40):
  r=run(['sudo','docker','exec',name,'pg_isready','-U','postgres','-d','ftyp'],capture_output=True)
  if r.returncode==0:break
  time.sleep(.5)
 else:raise RuntimeError('Fixture startup failed')
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
  admin("""TRUNCATE ftyp_hidden.submissions;
  INSERT INTO ftyp_hidden.submissions (submission_id,fbrf,user_data)
  VALUES (1,'FBrf0000001','{"text":"synthetic ordinary record"}');
  """)
  if mode=='empty':admin('DELETE FROM ftyp_hidden.submissions;')
  exported=[]
  def hooked(cmd,**kw):
   if cmd[0]=='docker':return run(['sudo']+cmd,**kw)
   if cmd[0]=='aws':
    raw=Path(cmd[-2]).read_bytes();exported.append(json.loads(raw))
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
   if mode=='empty':assert exported==[None]
   else:assert set(exported[0][0])=={'submission_id','fbrf','submitted_to_flybase','date_processed','user_data'}
   if mode=='success':
    assert result['acknowledged_rows']==1
   checks.append(label)
 for label,mode in [('native-full-row-delivery','success'),('failed-upload-no-ack','fail'),
                    ('edited-row-not-acknowledged','change'),('new-row-not-acknowledged','insert'),
                    ('empty-json-null','empty')]:case(label,mode)
 for target in ('DATABASE ftyp','TABLE ftyp_hidden.submissions'):
  admin('ALTER '+target+' OWNER TO ftyp_export_login;')
  def only_database(cmd,**kw):
   assert cmd[0]=='docker','Owner guard must stop before upload'
   return run(['sudo']+cmd,**kw)
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
 actual=run(['sudo','docker','inspect','--format','{{.Id}}',name],capture_output=True,text=True)
 assert actual.returncode==0 and actual.stdout.strip()==cid
 run(['sudo','docker','rm','-f',cid],check=True,capture_output=True)
 (base/'native-cleanup.json').write_text(json.dumps({'removed_owned_container':cid})+'\n')

