import 'reflect-metadata';
import * as n from '@nestjs/common';
import * as v from 'class-validator';
import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, EntitySchema } from 'typeorm';
import { argon2, randomBytes, timingSafeEqual } from 'node:crypto';
const schemas=[
  {
    "name": "students",
    "columns": {
      "studentId": {
        "type": "int",
        "primary": true,
        "generated": true
      },
      "firstName": {
        "type": "varchar",
        "nullable": false,
        "length": 50
      },
      "lastName": {
        "type": "varchar",
        "nullable": false,
        "length": 50
      },
      "email": {
        "type": "varchar",
        "nullable": false,
        "length": 100,
        "unique": true
      },
      "yearLevel": {
        "type": "tinyint",
        "nullable": false
      }
    },
    "relations": {}
  },
  {
    "name": "teachers",
    "columns": {
      "teacherId": {
        "type": "int",
        "primary": true,
        "generated": true
      },
      "firstName": {
        "type": "varchar",
        "nullable": false,
        "length": 50
      },
      "lastName": {
        "type": "varchar",
        "nullable": false,
        "length": 50
      },
      "email": {
        "type": "varchar",
        "nullable": false,
        "length": 100,
        "unique": true
      }
    },
    "relations": {}
  },
  {
    "name": "courses",
    "columns": {
      "courseId": {
        "type": "int",
        "primary": true,
        "generated": true
      },
      "courseName": {
        "type": "varchar",
        "nullable": false,
        "length": 100
      },
      "description": {
        "type": "varchar",
        "nullable": true,
        "length": 255
      },
      "teacherId": {
        "type": "int",
        "nullable": false
      }
    },
    "relations": {
      "teacherIdRef": {
        "type": "many-to-one",
        "target": "teachers",
        "joinColumn": {
          "name": "teacherId"
        },
        "onDelete": "RESTRICT"
      }
    }
  },
  {
    "name": "enrollments",
    "columns": {
      "enrollmentId": {
        "type": "int",
        "primary": true,
        "generated": true
      },
      "studentId": {
        "type": "int",
        "nullable": false
      },
      "courseId": {
        "type": "int",
        "nullable": false
      },
      "dateEnrolled": {
        "type": "date",
        "nullable": false
      },
      "status": {
        "type": "varchar",
        "nullable": false,
        "length": 20,
        "default": "Active"
      }
    },
    "relations": {
      "studentIdRef": {
        "type": "many-to-one",
        "target": "students",
        "joinColumn": {
          "name": "studentId"
        },
        "onDelete": "RESTRICT"
      },
      "courseIdRef": {
        "type": "many-to-one",
        "target": "courses",
        "joinColumn": {
          "name": "courseId"
        },
        "onDelete": "RESTRICT"
      }
    }
  },
  {
    "name": "attendances",
    "columns": {
      "attendanceId": {
        "type": "int",
        "primary": true,
        "generated": true
      },
      "enrollmentId": {
        "type": "int",
        "nullable": false
      },
      "attendanceDate": {
        "type": "date",
        "nullable": false
      },
      "status": {
        "type": "varchar",
        "nullable": false,
        "length": 15
      }
    },
    "relations": {
      "enrollmentIdRef": {
        "type": "many-to-one",
        "target": "enrollments",
        "joinColumn": {
          "name": "enrollmentId"
        },
        "onDelete": "RESTRICT"
      }
    }
  },
  {
    "name": "grades",
    "columns": {
      "gradeId": {
        "type": "int",
        "primary": true,
        "generated": true
      },
      "enrollmentId": {
        "type": "int",
        "nullable": false
      },
      "teacherId": {
        "type": "int",
        "nullable": false
      },
      "gradeValue": {
        "type": "decimal",
        "nullable": false,
        "precision": 5,
        "scale": 2
      },
      "dateRecorded": {
        "type": "date",
        "nullable": false
      }
    },
    "relations": {
      "enrollmentIdRef": {
        "type": "many-to-one",
        "target": "enrollments",
        "joinColumn": {
          "name": "enrollmentId"
        },
        "onDelete": "RESTRICT"
      },
      "teacherIdRef": {
        "type": "many-to-one",
        "target": "teachers",
        "joinColumn": {
          "name": "teacherId"
        },
        "onDelete": "RESTRICT"
      }
    }
  },
  {
    "name": "accounts",
    "columns": {
      "id": {
        "type": "int",
        "primary": true,
        "generated": true
      },
      "email": {
        "type": "varchar",
        "length": 100,
        "unique": true
      },
      "passwordHash": {
        "type": "varchar",
        "length": 255
      },
      "role": {
        "type": "enum",
        "enum": [
          "admin",
          "teacher",
          "student"
        ]
      },
      "studentId": {
        "type": "int",
        "nullable": true,
        "unique": true
      },
      "teacherId": {
        "type": "int",
        "nullable": true,
        "unique": true
      }
    },
    "relations": {
      "studentIdRef": {
        "type": "many-to-one",
        "target": "students",
        "joinColumn": {
          "name": "studentId"
        }
      },
      "teacherIdRef": {
        "type": "many-to-one",
        "target": "teachers",
        "joinColumn": {
          "name": "teacherId"
        }
      }
    }
  }
] .map(o=>new EntitySchema(o as any));
class studentsBody {
 @v.IsString()
 @v.Length(1,50)
 firstName!: string;
 @v.IsString()
 @v.Length(1,50)
 lastName!: string;
 @v.IsEmail()
 @v.MaxLength(100)
 email!: string;
 @v.IsInt()
 @v.Min(1)
 @v.Max(4)
 yearLevel!: number;
}
class studentsPatch {
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsString()
 @v.Length(1,50)
 firstName?: string;
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsString()
 @v.Length(1,50)
 lastName?: string;
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsEmail()
 @v.MaxLength(100)
 email?: string;
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsInt()
 @v.Min(1)
 @v.Max(4)
 yearLevel?: number;
}
class teachersBody {
 @v.IsString()
 @v.Length(1,50)
 firstName!: string;
 @v.IsString()
 @v.Length(1,50)
 lastName!: string;
 @v.IsEmail()
 @v.MaxLength(100)
 email!: string;
}
class teachersPatch {
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsString()
 @v.Length(1,50)
 firstName?: string;
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsString()
 @v.Length(1,50)
 lastName?: string;
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsEmail()
 @v.MaxLength(100)
 email?: string;
}
class coursesBody {
 @v.IsString()
 @v.Length(1,100)
 courseName!: string;
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsString()
 @v.MaxLength(255)
 description?: string;
 @v.IsInt()
 @v.Min(1)
 teacherId!: number;
}
class coursesPatch {
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsString()
 @v.Length(1,100)
 courseName?: string;
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsString()
 @v.MaxLength(255)
 description?: string;
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsInt()
 @v.Min(1)
 teacherId?: number;
}
class enrollmentsBody {
 @v.IsInt()
 @v.Min(1)
 studentId!: number;
 @v.IsInt()
 @v.Min(1)
 courseId!: number;
 @v.Matches(/^\d{4}-\d{2}-\d{2}$/)
 @v.IsDateString({strict:true})
 dateEnrolled!: string;
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsIn(['Active','Dropped'])
 status?: string;
}
class enrollmentsPatch {
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsInt()
 @v.Min(1)
 studentId?: number;
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsInt()
 @v.Min(1)
 courseId?: number;
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.Matches(/^\d{4}-\d{2}-\d{2}$/)
 @v.IsDateString({strict:true})
 dateEnrolled?: string;
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsIn(['Active','Dropped'])
 status?: string;
}
class attendancesBody {
 @v.IsInt()
 @v.Min(1)
 enrollmentId!: number;
 @v.Matches(/^\d{4}-\d{2}-\d{2}$/)
 @v.IsDateString({strict:true})
 attendanceDate!: string;
 @v.IsIn(['Present','Absent','Late'])
 status!: string;
}
class attendancesPatch {
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsInt()
 @v.Min(1)
 enrollmentId?: number;
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.Matches(/^\d{4}-\d{2}-\d{2}$/)
 @v.IsDateString({strict:true})
 attendanceDate?: string;
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsIn(['Present','Absent','Late'])
 status?: string;
}
class gradesBody {
 @v.IsInt()
 @v.Min(1)
 enrollmentId!: number;
 @v.IsNumber({maxDecimalPlaces:2})
 @v.Min(0)
 @v.Max(100)
 gradeValue!: number;
 @v.Matches(/^\d{4}-\d{2}-\d{2}$/)
 @v.IsDateString({strict:true})
 dateRecorded!: string;
}
class gradesPatch {
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsInt()
 @v.Min(1)
 enrollmentId?: number;
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.IsNumber({maxDecimalPlaces:2})
 @v.Min(0)
 @v.Max(100)
 gradeValue?: number;
 @v.ValidateIf((_o,value)=>value!==undefined)
 @v.Matches(/^\d{4}-\d{2}-\d{2}$/)
 @v.IsDateString({strict:true})
 dateRecorded?: string;
}

const ids: Record<string,string>={"students": "studentId", "teachers": "teacherId", "courses": "courseId", "enrollments": "enrollmentId", "attendances": "attendanceId", "grades": "gradeId"};
const jwt = new JwtService();
type Identity = {id:number; role:string; studentId?:number; teacherId?:number};
async function hash(password:string,salt:Buffer):Promise<Buffer>{
 return new Promise((resolve,reject)=>argon2('argon2id',{message:Buffer.from(password),nonce:salt,parallelism:1,memory:19456,passes:2,tagLength:32},(err,key)=>err?reject(err):resolve(key)));
}
function secret(){const s=process.env.JWT_SECRET;if(!s||s.length<32)throw new Error('Set JWT_SECRET to at least 32 characters');return s;}
class Login { @v.IsEmail() email!:string; @v.IsString() @v.Length(1,128) password!:string; }
class Account extends Login {
 @v.IsIn(['admin','student','teacher']) role!:string;
 @v.ValidateIf(o=>o.studentId!==undefined||o.role==='student') @v.IsInt() @v.Min(1) studentId?:number;
 @v.ValidateIf(o=>o.teacherId!==undefined||o.role==='teacher') @v.IsInt() @v.Min(1) teacherId?:number;
}
@n.Injectable()
class ApiService {
 constructor(readonly db:DataSource){}
 repo(t:string){return this.db.getRepository(t);}
 async one(t:string,id:number){const row=await this.repo(t).findOneBy({[ids[t]]:id});if(!row)throw new n.NotFoundException(t+' record not found');return row;}
 async identity(r:any, roles?:string[]):Promise<Identity>{
  const token=/^Bearer (\S+)$/i.exec(r.headers.authorization??'')?.[1];
  if(!token)throw new n.UnauthorizedException('Login required');
  let payload:any;
  try{payload=await jwt.verifyAsync(token,{secret:secret(),algorithms:['HS256']});}catch{throw new n.UnauthorizedException('Invalid or expired token');}
  const a=await this.repo('accounts').findOneBy({id:payload.sub});
  if(!a)throw new n.UnauthorizedException();
  if(roles&&!roles.includes(a.role))throw new n.ForbiddenException();
  return {id:a.id,role:a.role,studentId:a.studentId,teacherId:a.teacherId};
 }
 async account(d:Account){
  if(d.password.length<12||new Set(d.password).size<6)throw new n.BadRequestException('Use at least 12 characters with variety');
  if((d.role==='student')!==Boolean(d.studentId)||(d.role==='teacher')!==Boolean(d.teacherId))throw new n.BadRequestException('Profile must match account role');
  if(d.studentId)await this.one('students',d.studentId);
  if(d.teacherId)await this.one('teachers',d.teacherId);
  const salt=randomBytes(16);
  const {password,...fields}=d;
  const a=await this.repo('accounts').save({...fields,passwordHash:salt.toString('hex')+':'+(await hash(password,salt)).toString('hex')});
  return {id:a.id,email:a.email,role:a.role};
 }
 async login(d:Login){
  const a=await this.repo('accounts').findOneBy({email:d.email});
  const [salt,key]=a?.passwordHash.split(':')??['00000000000000000000000000000000','00'.repeat(32)];
  const k=await hash(d.password,Buffer.from(salt,'hex'));
  if(!timingSafeEqual(k,Buffer.from(key,'hex'))||!a)throw new n.UnauthorizedException('Invalid credentials');
  return {accessToken:await jwt.signAsync({sub:a.id},{secret:secret(),expiresIn:'15m',algorithm:'HS256'}),tokenType:'Bearer'};
 }
 async access(t:string,a:Identity,row:any){
  if(t==='students'&&a.role==='student'&&row.studentId!==a.studentId)throw new n.ForbiddenException();
  if(t==='enrollments'&&a.role==='student'&&row.studentId!==a.studentId)throw new n.ForbiddenException();
  if(['attendances','grades'].includes(t)){
   const enrollment=await this.one('enrollments',row.enrollmentId);
   const course=await this.one('courses',enrollment.courseId);
   if(a.role==='teacher'&&course.teacherId!==a.teacherId)throw new n.ForbiddenException();
   if(a.role==='student'&&enrollment.studentId!==a.studentId)throw new n.ForbiddenException();
   return enrollment;
  }
 }
 async list(t:string,a:Identity,q:any){
  const positive=(x:any,d:number)=>{if(x===undefined)return d;if(typeof x!=='string'||!/^\d+$/.test(x)||!Number.isSafeInteger(+x)||+x<1)throw new n.BadRequestException('Invalid query integer');return +x;};
  const page=positive(q.page,1),limit=Math.min(positive(q.limit,20),100);
  if(page>1000000)throw new n.BadRequestException('Page too large');
  const b=this.repo(t).createQueryBuilder('r');
  if(t==='students'&&a.role==='student')b.andWhere('r.studentId = :sid',{sid:a.studentId});
  if(['attendances','grades'].includes(t)){
   b.innerJoin('enrollments','e','e.enrollmentId = r.enrollmentId').innerJoin('courses','c','c.courseId = e.courseId');
   if(a.role==='teacher')b.andWhere('c.teacherId = :tid',{tid:a.teacherId});
   if(a.role==='student')b.andWhere('e.studentId = :sid',{sid:a.studentId});
   if(q.enrollmentId!==undefined)b.andWhere('r.enrollmentId = :eid',{eid:positive(q.enrollmentId,1)});
  }
  return {data:await b.orderBy('r.'+ids[t],'ASC').skip((page-1)*limit).take(limit).getMany(),page};
 }
 async save(t:string,a:Identity,d:any,id?:number,replace=false){
  const old=id===undefined?{}:await this.one(t,id);
  if(id!==undefined)await this.access(t,a,old);
  const row={...old,...d};
  if(replace&&t==='courses'&&d.description===undefined)row.description=null;
  if(t==='courses')await this.one('teachers',row.teacherId);
  if(t==='enrollments'){await this.one('students',row.studentId);await this.one('courses',row.courseId);}
  const e=await this.access(t,a,row);
  if(e&&e.status!=='Active')throw new n.BadRequestException('Enrollment must be active');
  if(t==='grades'&&id===undefined)row.teacherId=a.teacherId;
  return this.repo(t).save(row);
 }
 async remove(t:string,a:Identity,id:number){const row=await this.one(t,id);await this.access(t,a,row);await this.repo(t).remove(row);}
}
@n.Controller('auth')
class AuthController {
 private attempts=new Map<string,{count:number;until:number}>();
 constructor(private api:ApiService){}
 @n.Post('login') @n.HttpCode(200)
 login(@n.Body()d:Login,@n.Req()r:any){
  const now=Date.now();
  for(const [ip,entry] of this.attempts)if(entry.until<=now)this.attempts.delete(ip);
  const entry=this.attempts.get(r.ip)??{count:0,until:now+60000};
  if(++entry.count>10)throw new n.HttpException('Try again in one minute',429);
  this.attempts.set(r.ip,entry);return this.api.login(d);
 }
 @n.Get('profile') profile(@n.Req()r:any){return this.api.identity(r);}
 @n.Post('accounts') async create(@n.Req()r:any,@n.Body()d:Account){await this.api.identity(r,['admin']);return this.api.account(d);}
}

@n.Controller('students')
class StudentsController {
 constructor(private api:ApiService){}
 @n.Get('') @n.HttpCode(200) async list(@n.Req()r:any,@n.Query()q:any){const a=await this.api.identity(r,undefined);return this.api.list('students',a,q);}
 @n.Get(':id') @n.HttpCode(200) async read(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number){const a=await this.api.identity(r,undefined);const row=await this.api.one('students',i);await this.api.access('students',a,row);return row;}
 @n.Post('') @n.HttpCode(201) async create(@n.Req()r:any,@n.Body()d:studentsBody){const a=await this.api.identity(r,['admin']);return this.api.save('students',a,d);}
 @n.Patch(':id') @n.HttpCode(200) async update(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number,@n.Body()d:studentsPatch){const a=await this.api.identity(r,['admin']);return this.api.save('students',a,d,i);}
 @n.Delete(':id') @n.HttpCode(204) async delete(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number){const a=await this.api.identity(r,['admin']);await this.api.remove('students',a,i);}
 @n.Put(':id') @n.HttpCode(200) async replace(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number,@n.Body()d:studentsBody){const a=await this.api.identity(r,['admin']);return this.api.save('students',a,d,i,true);}
 @n.Get(':id/enrollments') async enrollments(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number){const a=await this.api.identity(r);await this.api.access('students',a,await this.api.one('students',i));return {data:await this.api.repo('enrollments').findBy({studentId:i})};}
 @n.Get(':id/report') async report(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number){const a=await this.api.identity(r,['student','admin']);await this.api.access('students',a,await this.api.one('students',i));const enrollments=await this.api.repo('enrollments').findBy({studentId:i});return {data:await Promise.all(enrollments.map(async e=>({enrollment:e,attendance:await this.api.repo('attendances').findBy({enrollmentId:e.enrollmentId}),grades:await this.api.repo('grades').findBy({enrollmentId:e.enrollmentId})})))};}
}

@n.Controller('teachers')
class TeachersController {
 constructor(private api:ApiService){}
 @n.Get('') @n.HttpCode(200) async list(@n.Req()r:any,@n.Query()q:any){const a=await this.api.identity(r,undefined);return this.api.list('teachers',a,q);}
 @n.Get(':id') @n.HttpCode(200) async read(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number){const a=await this.api.identity(r,undefined);const row=await this.api.one('teachers',i);await this.api.access('teachers',a,row);return row;}
 @n.Post('') @n.HttpCode(201) async create(@n.Req()r:any,@n.Body()d:teachersBody){const a=await this.api.identity(r,['admin']);return this.api.save('teachers',a,d);}
 @n.Patch(':id') @n.HttpCode(200) async update(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number,@n.Body()d:teachersPatch){const a=await this.api.identity(r,['admin']);return this.api.save('teachers',a,d,i);}
 @n.Delete(':id') @n.HttpCode(204) async delete(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number){const a=await this.api.identity(r,['admin']);await this.api.remove('teachers',a,i);}
}

@n.Controller('courses')
class CoursesController {
 constructor(private api:ApiService){}
 @n.Get('') @n.HttpCode(200) async list(@n.Req()r:any,@n.Query()q:any){const a=await this.api.identity(r,undefined);return this.api.list('courses',a,q);}
 @n.Get(':id') @n.HttpCode(200) async read(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number){const a=await this.api.identity(r,undefined);const row=await this.api.one('courses',i);await this.api.access('courses',a,row);return row;}
 @n.Post('') @n.HttpCode(201) async create(@n.Req()r:any,@n.Body()d:coursesBody){const a=await this.api.identity(r,['admin']);return this.api.save('courses',a,d);}
 @n.Patch(':id') @n.HttpCode(200) async update(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number,@n.Body()d:coursesPatch){const a=await this.api.identity(r,['admin']);return this.api.save('courses',a,d,i);}
 @n.Delete(':id') @n.HttpCode(204) async delete(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number){const a=await this.api.identity(r,['admin']);await this.api.remove('courses',a,i);}
}

@n.Controller('enrollments')
class EnrollmentsController {
 constructor(private api:ApiService){}
 @n.Get('') @n.HttpCode(200) async list(@n.Req()r:any,@n.Query()q:any){const a=await this.api.identity(r,undefined);return this.api.list('enrollments',a,q);}
 @n.Get(':id') @n.HttpCode(200) async read(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number){const a=await this.api.identity(r,undefined);const row=await this.api.one('enrollments',i);await this.api.access('enrollments',a,row);return row;}
 @n.Post('') @n.HttpCode(201) async create(@n.Req()r:any,@n.Body()d:enrollmentsBody){const a=await this.api.identity(r,['admin']);return this.api.save('enrollments',a,d);}
 @n.Patch(':id') @n.HttpCode(200) async update(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number,@n.Body()d:enrollmentsPatch){const a=await this.api.identity(r,['admin']);return this.api.save('enrollments',a,d,i);}
 @n.Delete(':id') @n.HttpCode(204) async delete(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number){const a=await this.api.identity(r,['admin']);await this.api.remove('enrollments',a,i);}
}

@n.Controller('attendances')
class AttendancesController {
 constructor(private api:ApiService){}
 @n.Get('') @n.HttpCode(200) async list(@n.Req()r:any,@n.Query()q:any){const a=await this.api.identity(r,['teacher','admin']);return this.api.list('attendances',a,q);}
 @n.Get(':id') @n.HttpCode(200) async read(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number){const a=await this.api.identity(r,['teacher','admin']);const row=await this.api.one('attendances',i);await this.api.access('attendances',a,row);return row;}
 @n.Post('') @n.HttpCode(201) async create(@n.Req()r:any,@n.Body()d:attendancesBody){const a=await this.api.identity(r,['teacher']);return this.api.save('attendances',a,d);}
 @n.Patch(':id') @n.HttpCode(200) async update(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number,@n.Body()d:attendancesPatch){const a=await this.api.identity(r,['teacher']);return this.api.save('attendances',a,d,i);}
 @n.Delete(':id') @n.HttpCode(204) async delete(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number){const a=await this.api.identity(r,['teacher']);await this.api.remove('attendances',a,i);}
}

@n.Controller('grades')
class GradesController {
 constructor(private api:ApiService){}
 @n.Get('') @n.HttpCode(200) async list(@n.Req()r:any,@n.Query()q:any){const a=await this.api.identity(r,['teacher','admin']);return this.api.list('grades',a,q);}
 @n.Get(':id') @n.HttpCode(200) async read(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number){const a=await this.api.identity(r,['teacher','admin']);const row=await this.api.one('grades',i);await this.api.access('grades',a,row);return row;}
 @n.Post('') @n.HttpCode(201) async create(@n.Req()r:any,@n.Body()d:gradesBody){const a=await this.api.identity(r,['teacher']);return this.api.save('grades',a,d);}
 @n.Patch(':id') @n.HttpCode(200) async update(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number,@n.Body()d:gradesPatch){const a=await this.api.identity(r,['teacher']);return this.api.save('grades',a,d,i);}
 @n.Delete(':id') @n.HttpCode(204) async delete(@n.Req()r:any,@n.Param('id',n.ParseIntPipe)i:number){const a=await this.api.identity(r,['teacher']);await this.api.remove('grades',a,i);}
}

@n.Catch()
class ErrorFilter implements n.ExceptionFilter {
 catch(e:any,h:n.ArgumentsHost){
  const sql=e?.driverError?.code;
  const status=e instanceof n.HttpException?e.getStatus():['ER_DUP_ENTRY','ER_ROW_IS_REFERENCED_2'].includes(sql)?409:sql==='ER_NO_REFERENCED_ROW_2'?404:500;
  const raw:any=e instanceof n.HttpException?e.getResponse():null;
  const message=typeof raw==='string'?raw:raw?.message??({409:'Duplicate or referenced record',404:'Related record not found'} as any)[status]??'Internal server error';
  h.switchToHttp().getResponse().status(status).json({success:false,statusCode:status,message:Array.isArray(message)?'Validation failed':message,errors:Array.isArray(message)?message:[message],timestamp:new Date().toISOString()});
 }
}
@n.Module({imports:[ConfigModule.forRoot({isGlobal:true}),TypeOrmModule.forRootAsync({useFactory:()=>({
 type:'mysql', host:process.env.DB_HOST??'127.0.0.1',port:Number(process.env.DB_PORT??3306),username:process.env.DB_USERNAME??'root',password:process.env.DB_PASSWORD??'',database:'edutrack',entities:schemas,synchronize:false,retryAttempts:1
})})],controllers:[AuthController,StudentsController,TeachersController,CoursesController,EnrollmentsController,AttendancesController,GradesController],providers:[ApiService]})
class AppModule {}
async function main(){
 if(process.argv.includes('--seed-admin')){
  const app=await NestFactory.createApplicationContext(AppModule);
  try{
   const d=Object.assign(new Account(),{email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD,role:'admin'});
   await v.validateOrReject(d);const result=await app.get(ApiService).account(d);console.log('Created administrator:',result.email);
  }catch{console.error('Admin creation failed. Check credentials, password policy, and duplicate email.');process.exitCode=1;}
  finally{await app.close();}
 }else{
  const app=await NestFactory.create(AppModule);secret();app.setGlobalPrefix('api/v1');app.useGlobalPipes(new n.ValidationPipe({transform:true,whitelist:true,forbidNonWhitelisted:true}));app.useGlobalFilters(new ErrorFilter());await app.listen(Number(process.env.PORT??3000),'127.0.0.1');
 }
}
void main();
