/* Run against a local demo database. Creates synthetic fixtures, including two accounts. */
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const base = 'http://127.0.0.1:3000/api/v1';
const suffix = randomUUID().slice(0,8);
const password = randomUUID();
const covered = new Set();
let admin, teacher, student;
async function request(method, route, expected, token, body) {
  const r = await fetch(base+route, {
    method, headers: {'Content-Type':'application/json', ...(token ? {Authorization:'Bearer '+token}: {})},
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const raw = await r.text();
  assert.equal(r.status, expected, method+' '+route+': '+raw);
  if (expected < 300) covered.add(method+' '+route.split('?')[0].replace(/\/\d+(?=\/|$)/g,'/:id'));
  return raw ? JSON.parse(raw) : undefined;
}
const get = (path, token=admin) => request('GET',path,200,token);
const create = (path, fields, token=admin) => request('POST',path,201,token,fields);
const patch = (path, fields, token=admin) => request('PATCH',path,200,token,fields);
const del = (path, token=admin) => request('DELETE',path,204,token);
const login = async (email,password) => (await request('POST','/auth/login',200,null,{email,password})).accessToken;
async function main(){
  assert(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD,'Set ADMIN_EMAIL and ADMIN_PASSWORD for the local administrator');
  const profile = (kind) => ({firstName:'Demo',lastName:'Test',email:kind+'-'+suffix+'@example.test'});
  admin = await login(process.env.ADMIN_EMAIL,process.env.ADMIN_PASSWORD);
  assert.equal((await get('/auth/profile')).role,'admin');
  const s = {...profile('student'),yearLevel:1};
  const {studentId:sid} = await create('/students',s);
  const {studentId:other} = await create('/students',{...profile('other'),yearLevel:1});
  const {teacherId:tid} = await create('/teachers',profile('teacher'));
  const {teacherId:tempTeacher} = await create('/teachers',profile('temp-teacher'));
  for(const [t,id] of [['students',sid],['teachers',tid]]){ await get('/'+t); await get('/'+t+'/'+id); }
  await request('PUT','/students/'+sid,200,admin,{...s,yearLevel:2});
  assert.equal((await patch('/students/'+sid,{yearLevel:3})).yearLevel,3);
  await patch('/teachers/'+tid,{firstName:'Assigned'});
  const {courseId:cid}=await create('/courses',{courseName:'Test '+suffix,teacherId:tid});
  await get('/courses');await get('/courses/'+cid);await patch('/courses/'+cid,{description:'Test course'});
  const {enrollmentId:eid}=await create('/enrollments',{studentId:sid,courseId:cid,dateEnrolled:'2026-11-27'});
  await get('/enrollments');await get('/enrollments/'+eid);await patch('/enrollments/'+eid,{status:'Active'});
  const teacherEmail='teacher-login-'+suffix+'@example.test';
  const studentEmail='student-login-'+suffix+'@example.test';
  await create('/auth/accounts',{email:teacherEmail,password,role:'teacher',teacherId:tid});
  await create('/auth/accounts',{email:studentEmail,password,role:'student',studentId:sid});
  teacher=await login(teacherEmail,password);student=await login(studentEmail,password);
  const {attendanceId:aid}=await create('/attendances',{enrollmentId:eid,attendanceDate:'2026-11-27',status:'Present'},teacher);
  const {gradeId:gid}=await create('/grades',{enrollmentId:eid,gradeValue:95.5,dateRecorded:'2026-11-27'},teacher);
  assert((await get('/attendances?enrollmentId='+eid,teacher)).data.some(x=>x.attendanceId===aid));
  assert((await get('/grades?enrollmentId='+eid,teacher)).data.some(x=>x.gradeId===gid));
  await get('/attendances/'+aid,teacher);await get('/grades/'+gid,teacher);
  await patch('/attendances/'+aid,{status:'Late'},teacher);await patch('/grades/'+gid,{gradeValue:96},teacher);
  assert((await get('/students/'+sid+'/enrollments',student)).data.some(x=>x.enrollmentId===eid));
  assert((await get('/students/'+sid+'/report',student)).data.some(x=>x.grades.some(g=>g.gradeId===gid)));
  await request('GET','/students/'+other+'/report',403,student);
  await request('GET','/grades',403,student);
  await request('POST','/students',403,teacher,s);
  await request('GET','/students',401,null);
  await request('POST','/students',400,admin,{...profile('invalid'),yearLevel:5});
  await request('POST','/students',409,admin,s);
  await del('/attendances/'+aid,teacher);await del('/grades/'+gid,teacher);
  await del('/enrollments/'+eid);await del('/courses/'+cid);
  await del('/students/'+other);await del('/teachers/'+tempTeacher);
  await request('GET','/students/'+other,404,admin);
  assert.equal(covered.size,36);
  console.log('PASS: 36 distinct API routes; 7 validation and access-control checks.');
  console.log('Retained synthetic account/profile fixtures with suffix '+suffix);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
