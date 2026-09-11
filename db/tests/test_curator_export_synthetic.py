import importlib.util,json,tempfile,subprocess,os
from pathlib import Path
from unittest.mock import patch
p=Path(os.environ['FTYP_EXPORT_TEST_EVIDENCE']);p.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('export',Path(__file__).resolve().parents[1]/'scripts/deliver_submissions.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
rows=[{'submission_id':1,'fbrf':'FBrf0000001','submitted_to_flybase':'2026-09-11','date_processed':None,'user_data':{'text':"literal quote ' and newline\\n"}}]
checks=[]
def case(name,upload_code=0,ack=b'1\n',data=rows,role=b't\n',expect_error=False):
 calls=[]
 def fake(cmd,**kw):
  calls.append((cmd,kw))
  if cmd[0]=='aws':
   assert Path(cmd[-2]).read_bytes()==(json.dumps(data)+'\n').encode()
   return subprocess.CompletedProcess(cmd,upload_code,b'',b'')
  sql=kw['input'].decode()
  if 'pg_roles' in sql:out=role
  elif 'BEGIN READ ONLY' in sql:out=(json.dumps(data)+'\n').encode()
  else:
   assert 'AND to_jsonb(s)=d.row' in sql and 'AND s.date_processed IS NULL' in sql
   out=ack
  return subprocess.CompletedProcess(cmd,0,out,b'')
 with tempfile.TemporaryDirectory(dir=p) as root:
  failed=False
  with patch.object(m.subprocess,'run',fake):
   try:m.deliver('synthetic-db','weds',root)
   except RuntimeError:failed=True
  assert failed==expect_error,name
  aws=[i for i,(cmd,_) in enumerate(calls) if cmd[0]=='aws']
  updates=[i for i,(_,kw) in enumerate(calls) if b'UPDATE ftyp_hidden' in kw.get('input',b'')]
  if upload_code or role!=b't\n':assert not updates
  if updates:assert aws and updates[0]>aws[0]
  if data is None:assert not updates
 checks.append(name)
case('delivery-before-exact-ack')
case('failed-delivery-leaves-dates',upload_code=1,expect_error=True)
case('changed-row-detected',ack=b'0\n',expect_error=True)
case('empty-preserves-null-contract',data=None)
case('privileged-login-rejected',role=b'f\n',expect_error=True)
try:m.sql_command('bad name')
except ValueError:checks.append('invalid-container-rejected')
assert len(checks)==6
(p/'synthetic-result.json').write_text(json.dumps({'pass':True,'checks':checks,'real_database_used':False,'s3_used':False},indent=2)+'\n')
print(json.dumps({'pass':True,'checks':len(checks)}))

