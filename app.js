/**
 * Module dependencies.
 */

var express = require('express'), 
	routes = require('./routes'), 
	user = require('./routes/user'), 
	http = require('http'), 
	path = require('path'),
	fs = require('fs'),
	mysql = require('mysql'),
	db_connector = require('./routes/database_connector'),
	client = db_connector.connect(mysql),
//	client = db_connector.connect(mysql),
	moment = require('moment'),
	map = require('./routes/map'),
	app = express();

// all environments
app.set('port', process.env.PORT || 1337);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(app.router);
app.use(express.static(path.join(__dirname, '/public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

/** ************************************************************************************** */

var second = 1000;
var minute = 60 * second;
var hour = 60 * minute;

Map = function() {
	this.map = new Object();
};

Map.prototype = {
	put : function(key, value) {
		this.map[key] = value;
	},
	get : function(key) {
		return this.map[key];
	},
	containsKey : function(key) {
		return key in this.map;
	},
	containsValue : function(value) {
		for ( var prop in this.map) {
			if (this.map[prop] == value)
				return true;
		}
		return false;
	},
	isEmpty : function(key) {
		return (this.size() == 0);
	},
	clear : function() {
		for ( var prop in this.map) {
			delete this.map[prop];
		}
	},
	remove : function(key) {
		delete this.map[key];
	},
	keys : function() {
		var keys = new Array();
		for ( var prop in this.map) {
			keys.push(prop);
		}
		return keys;
	},
	values : function() {
		var values = new Array();
		for ( var prop in this.map) {
			values.push(this.map[prop]);
		}
		return values;
	},
	size : function() {
		var count = 0;
		for ( var prop in this.map) {
			count++;
		}
		return count;
	}
};

var map = new Map();
map.put('am9', '1');
map.put('am10', '2');
map.put('am11', '3');
map.put('pm12', '4');
map.put('pm1', '5');
map.put('pm2', '6');
map.put('pm3', '7');
map.put('pm4', '8');
map.put('pm5', '9');
map.put('pm6', 'A');
map.put('pm7', 'B');
map.put('pm8', 'C');
map.put('pm9', 'D');
map.put('pm10', 'E');
map.put('pm11', 'F');
map.put('am12', 'G');

map.put('Monday', "월");
map.put('Tuesday', "화");
map.put('Wednesday', "수");
map.put('Thursday', "목");
map.put('Fridat', "금");
map.put('Saturday', "토");
map.put('Sunday', "일");

var server   = 
	http.createServer(app).listen(app.get('port'), function() {
		console.log('Express server listening on port ' + app.get('port'));
});

var socketio = require('socket.io');
var io = socketio.listen(server);

var at = "'출석'";
var la = "'지각'";
var ab = "'결석'";

io.set('log level', 0);

io.sockets.on('connection', function(socket) {
	
	/* 가원이 이벤트 */
	
	var checknotice=0;
	
	socket.on("getNewNoticeList", function(id, send){
		
//			console.log('이벤트받앗쩌염뿌우');
	      
	      var cnt=0;
	      var rows;
	      
	      client.query("select Lname,Sno from teradb.lecture JOIN teradb.enrol on teradb.lecture.Lno=teradb.enrol.Lno where Sno='"+id+"' group by Lname;", function(error,
	            rows1, cols) {
	         if (error) {                        // 서버측의 오류
	            console.log('getnewnoticelist1 쿼리문의 오류..');
	         } else if(rows1.length <= 0 ){            // 클라이언트가 잘못된 정보를 입력.
	            console.log('조회된 데이터가 없습니다.');
	            var data=[];
	            rows=data;
	         } else {                           // 성공시
	            checknotice=checknotice+1;
	            //console.log("course:"+rows1.length);
	            
	            cnt = rows1.length;
	            rows=rows1;
	         }
	         
	      });
	      
	      client.query("SELECT Nno,Lname,Ntitle,Pname,Ndate,Nbody FROM teradb.notice JOIN teradb.professor JOIN teradb.lecture ON teradb.notice.Pid = teradb.professor.Pid && teradb.lecture.Lno = teradb.notice.Lno where teradb.notice.Lno in (select teradb.enrol.Lno from teradb.enrol where Sno='"+id+"')  ORDER BY Ndate DESC;", function(error,
	            rows2, cols) {
	         if (error) {                        // 서버측의 오류
	            console.log('getnewnoticelist2 쿼리문의 오류..');
	         } else if(rows2.length <= 0 ){            // 클라이언트가 잘못된 정보를 입력.
	            console.log('조회된 데이터가 없습니다.');
	            var data=[];
	            send(rows,data);
	         } else {                           // 성공시
	            
	            checknotice=checknotice+1;
	            //console.log(rows2);
	            
	            console.log(checknotice);
	            
	            //console.log(rows);
	            if(checknotice>=2){ send(rows,rows2);
//	            console.log('보냈습니다');
	            }
	         }
	      });      
	      
	   });
	   
	   var cknotice=0;
	   
	   socket.on("professorNotice", function(id, send){
	      
	      var cnt=0;
	      var rows;
	      
	      client.query("select Lno, Lname, Pname from  teradb.lecture  join teradb.professor on teradb.professor.Pid=teradb.lecture.Pid where teradb.lecture.Pid='"+id+"' group by Lname;", function(error,
	            rows1, cols) {
	         if (error) {                        // 서버측의 오류
	            console.log('professorNotice1 쿼리문의 오류..');
	         } else if(rows1.length <= 0 ){            // 클라이언트가 잘못된 정보를 입력.
	            console.log('조회된 데이터가 없습니다.1');
	            var data=[];
	            rows=data;
	         } else {                           // 성공시
	            cknotice = cknotice+1;
	            
	            console.log("course:"+rows1.length);
	            
	            cnt = rows1.length;
	            rows=rows1;
	            console.log(rows);
	         }
	         
	      });
	      
	      client.query("select Nno,teradb.notice.Lno,Lname,Ntitle,Pname,Ndate,Nbody from teradb.notice join teradb.lecture on teradb.lecture.Lno=teradb.notice.Lno join teradb.professor on teradb.professor.Pid=teradb.notice.Pid where teradb.notice.Pid='"+id+"'  ORDER BY Ndate DESC;", function(error,
	            rows2, cols) {
	         if (error) {                        // 서버측의 오류
	            console.log('professorNotice2 쿼리문의 오류..');
	         } else if(rows2.length <= 0 ){            // 클라이언트가 잘못된 정보를 입력.
	            console.log('조회된 데이터가 없습니다.2');
	            var data=[];
	            console.log(data);
	            send(rows,data);
	         } else {                           // 성공시
	            
	            cknotice = cknotice+1;
	            console.log(rows2);
	            
	            console.log(rows);
	            console.log(cknotice);
	            if(cknotice>=2){ send(rows,rows2);}
	         }
	      });
	      
	   });
	
	
	socket.on("professorNoticeDelete", function(Nno, send){
		client.query("delete from teradb.notice where Nno='"+Nno+"';", function(error,
				rows, cols) {
			if (error) {								// 서버측의 오류
				console.log('professorNoticeDelete 쿼리문의 오류..');
			} else {									// 성공시	
				console.log(rows);
				send(rows);
			}
		});
		
	});
	
	socket.on("professorNoticeAdd", function(data, send){
		console.log(""+data.Pid+","+data.Lno+","+data.Ndate+","+data.Ntitle+","+data.Nbody+"");
		client.query("insert into teradb.notice values (null,'"+data.Pid+"','"+data.Lno+"','"+data.Ndate+"','"+data.Ntitle+"','"+data.Nbody+"');", function(error,
				rows, cols) {
			if (error) {								// 서버측의 오류
				console.log('professorNoticeAdd 쿼리문의 오류..');
			} else {									// 성공시	
				console.log("Add cpt");
				send(rows);
			}
		});
		
	});
	
	socket.on("professorNoticeUpdate", function(data, send){
		console.log(""+data.Pid+","+data.Lno+","+data.Ndate+","+data.Ntitle+","+data.Nbody+"");
		client.query("update teradb.notice set Ndate='"+data.Ndate+"' , Ntitle='"+data.Ntitle+"' , Nbody='"+data.Nbody+"' where Nno='"+data.Nno+"';", function(error,
				rows, cols) {
			if (error) {								// 서버측의 오류
				console.log('professorNoticeAdd 쿼리문의 오류..');
			} else {									// 성공시	
				console.log("UPdate cpt");
				send(rows);
			}
		});
		
	});

	
	/*-----빵코드-----*/
	
	socket.on("getRoomList", function(data, send){
	      console.log(data.Rname);
	      client.query("SELECT teradb.lecture.Lname, teradb.lecture.Lday, teradb.lecture.Lperiod FROM lecture join lectroom on lecture.Rname=lectroom.Rname where lecture.Rname='"+data.Rname+"' group by Lday, Lperiod;", function(error, rows, cols) {
	         if (error) {                        	  // 서버측의 오류
	            console.log('query error..');
	         } else if(rows.length <= 0 ){            // 클라이언트가 잘못된 정보를 입력.
	            console.log('cannot find data');
	         } else {                           	  // 성공시
	        	 console.log(rows);
	            send(rows);
	         }
	      });      
	   });
	
		var ck_notice=0;
	   
	   socket.on('getLectureRoomList', function(data, send){
	       var cnt=0;
	       var rows;
	      // 전체 강의실
	       client.query("select teradb.lectroom.Rname, teradb.lecture.Lday, teradb.lecture.Lperiod from teradb.lectroom left join teradb.lecture on teradb.lectroom.Rname=teradb.lecture.Rname group by Rname order by Rname;", function(error,rows1,cols) {
	         
	            if (error) {                        // 서버측의 오류
	               console.log('쿼리문의 오류..');
	            } else if(rows1.length <= 0 ){            // 클라이언트가 잘못된 정보를 입력.
	               console.log('1 : 조회된 데이터가 없습니다.');
	            } else {                           // 성공시
	               ck_notice = ck_notice+1;
	            //send(rows);
	            console.log("course:"+rows1.length);
	            
	            cnt = rows1.length;
	            rows=rows1;
	            console.log(rows1);                             
	            }      
	      });
	         
	       	 //			   select teradb.lectroom.Rname, teradb.lecture.Lday, teradb.lecture.Lperiod from teradb.lectroom left join teradb.lecture on teradb.lectroom.Rname=teradb.lecture.Rname group by Rname order by Rname;
	         client.query("select teradb.lectroom.Rname, teradb.lecture.Lday, teradb.lecture.Lperiod from teradb.lectroom left join teradb.lecture on teradb.lectroom.Rname=teradb.lecture.Rname where teradb.lecture.Lday='"+data.day+"' && teradb.lecture.Lperiod='"+data.time+"' group by Rname order by Rname; ", function(error,rows2,cols) {
	             
	             if (error) {                        // 서버측의 오류
	                console.log('쿼리문의 오류..');
	             } else if(rows2.length <= 0 ){            // 클라이언트가 잘못된 정보를 입력.
	                //console.log('2 : 조회된 데이터가 없습니다.');
	            	 var data=[];
	 	            console.log(data);
	 	            send(rows,data);
	             } else {                           // 성공시
	                ck_notice = ck_notice+1;
	             console.log(rows2);            
	             console.log(rows2);
	             console.log(ck_notice);
	             if(ck_notice>=2){ send(rows,rows2);}
	             }     
	       
	       });
	   });
	/*----------------*/
	
	socket.on("sendAttendanceResult", function(result){
		
		console.log(result.Lno+" : "+result.Sno+" : "+result.Date+" : "+result.Stat);
		client.query("INSERT INTO rollbook (Lno, Sno, Date, Stat) VALUES ("+result.Lno+","+result.Sno+",'"+result.Date+"','"+result.Stat+"');", function(error, data){
			if (error) {								// 서버측의 오류
				console.log(error);
			} else if(data.length <= 0 ){				// 클라이언트가 잘못된 정보를 입력.
				console.log('조회된 데이터가 없습니다.');
			} else {									// 성공시
				console.log(data);
			}
		});
	});
	
	socket.on("studentLogin", function(id, send){
//		var client = db_connector.connect(mysql);
		client.query("SELECT Sno, Sname, Dept, Year FROM teradb.student where Sno='"+id+"';", function(error, data){
			if (error) {								// 서버측의 오류
				console.log('쿼리문의 오류..');
			} else if(data.length <= 0 ){				// 클라이언트가 잘못된 정보를 입력.
				console.log('조회된 데이터가 없습니다.');
			} else {									// 성공시
//				console.log(data);
				io.set(id, data);
				send(data);
			}
		});
	});
	
	socket.on("professorLogin", function(id, send){
//		var client = db_connector.connect(mysql);
		client.query("SELECT Pname, Pid FROM teradb.professor where Pid='"+id+"';", function(error, data){
			if (error) {								// 서버측의 오류
				console.log('쿼리문의 오류..');
			} else if(data.length <= 0 ){				// 클라이언트가 잘못된 정보를 입력.
				console.log('조회된 데이터가 없습니다.');
			} else {									// 성공시
//				console.log(data);
				io.set(id, data);
				send(data);
			}
		});
	});
	
	//SELECT Lcode, Dev, Lname, Rname FROM teradb.lecture JOIN teradb.enrol ON teradb.enrol.Lno = teradb.lecture.Lno WHERE Sno='20090022' GROUP BY Lname;
	socket.on("getStudentCourseList", function(data, send){
//		var client = db_connector.connect(mysql);
		var studentInfo = io.get(data.id)[0];
		console.log(data.id+" "+data.pwd);
		console.log("학번 : "+studentInfo.Sno+", 이름 : "+studentInfo.Sname+", 학과 : "+studentInfo.Dept+", 학년 : "+studentInfo.Year);
		client.query("SELECT * FROM teradb.lecture JOIN teradb.enrol ON teradb.enrol.Lno = teradb.lecture.Lno WHERE Sno='"+data.id+"'", function(error,
				rows, cols) {
			if (error) {								// 서버측의 오류
				console.log('쿼리문의 오류..');
			} else if(rows.length <= 0 ){				// 클라이언트가 잘못된 정보를 입력.
				console.log('조회된 데이터가 없습니다.');
			} else {									// 성공시
//				console.log(rows);
				send(rows);
			}
		});
	});
	
	socket.on("getProfessorCourseList", function(data, send){
//		var client = db_connector.connect(mysql);
		console.log(data.id+" "+data.pwd);
		// SELECT * FROM teradb.lecture where Pid='F00443'
		client.query("SELECT * FROM teradb.lecture where Pid='"+data.id+"';", function(error,
				rows, cols) {
			if (error) {								// 서버측의 오류
				console.log('쿼리문의 오류..');
			} else if(rows.length <= 0 ){				// 클라이언트가 잘못된 정보를 입력.
				console.log('조회된 데이터가 없습니다.');
			} else {									// 성공시
//				console.log(rows);
				send(rows);
			}
		});
	});
	
	socket.on("getTakeCourseList", function(data, send){
		var room = data.rname;	// 강의실 이름을 가져오기.
//		var client = db_connector.connect(mysql);
//		console.log(room);
		// SELECT Year, teradb.student.Sno, Sname FROM teradb.enrol JOIN teradb.student ON teradb.enrol.Sno = teradb.student.Sno where Lno='8';
		client.query("SELECT Year, teradb.student.Sno, Sname FROM teradb.enrol JOIN teradb.student " +
				"ON teradb.enrol.Sno = teradb.student.Sno where Lno='"+data.lno+"';", function(error, rows, cols) {
			if (error) {								// 서버측의 오류
				console.log('쿼리문의 오류..');
			} else if(rows.length <= 0 ){				// 클라이언트가 잘못된 정보를 입력.
				console.log('조회된 데이터가 없습니다.');
			} else {									// 성공시
				socket.join(room);
				send(rows);
				console.log(io.sockets.manager.rooms);
			}
		});
	});
	
	
	/*
	socket.on("getTakeCourseList", function(data, send){
		// SELECT Year, teradb.student.Sno, Sname FROM teradb.enrol JOIN teradb.student ON teradb.enrol.Sno = teradb.student.Sno where Lno='8';
		client.query("SELECT Year, teradb.student.Sno, Sname FROM teradb.enrol JOIN teradb.student ON teradb.enrol.Sno = teradb.student.Sno where Lno='"+data+"';", function(error, rows, cols) {
			if (error) {								// 서버측의 오류
				console.log('쿼리문의 오류..');
			} else if(rows.length <= 0 ){				// 클라이언트가 잘못된 정보를 입력.
//				console.log('조회된 데이터가 없습니다.');
			} else {									// 성공시
				send(rows);
			}
		});
	});
	*/

	socket.on("studentEntered", function(currentRoom){
		console.log(currentRoom+"에 학생이 입장했습니다.");
		socket.join(currentRoom);
	});
	
	socket.on("professorEntered", function(currentRoom){
		console.log(currentRoom+"에 교수님이 입장하셨습니다.");
		socket.join(currentRoom);
//		io.sockets.in(currentRoom).emit("notifyProfessorEnterd");
		socket.broadcast.to(currentRoom).emit("notifyProfessorEnterd"); 
	});

	socket.on("attendanceRequest", function(object){
//		var client = db_connector.connect(mysql);
		console.log(object);
		socket.join(object.rname);
		socket.broadcast.to(object.rname).emit("check", object);
//		socket.broadcast.emit('check', object);
		// 클라이언트에서 보낸 이벤트는, 서버에서 또 이벤트를 발생시키면 같은 곳에서만 돈다.
	});

	
	socket.on("getBeaconInfos", function(send){
//		var client = db_connector.connect(mysql);
		// SELECT Buuid, Bmajor, Bminor FROM lectroom;
		client.query("SELECT Rname, Bmajor, Bminor FROM lectroom", function(error,
				rows, cols) {
			if (error) {								// 서버측의 오류
				console.log('쿼리문의 오류..');
			} else if(rows.length <= 0 ){				// 클라이언트가 잘못된 정보를 입력.
				console.log('조회된 데이터가 없습니다.');
			} else {									// 성공시
				console.log("jhkhuhkuhkuhkh");
				send(rows);
//				socket.emit("responseBeaconInfos", rows);
			}
		});
	});

	socket.on("requestCurrentStudentAttendanceState", function(id, send){
		console.log(id);
		// SELECT teradb.rollbook.Sno, teradb.rollbook.Date, teradb.lecture.Lday, teradb.lecture.Lperiod, teradb.rollbook.Stat, teradb.lecture.Lname, teradb.professor.Pname FROM teradb.rollbook JOIN teradb.lecture JOIN teradb.professor ON teradb.rollbook.Lno = teradb.lecture.Lno && teradb.lecture.Pid = teradb.professor.Pid WHERE Sno='20090022' ORDER BY teradb.rollbook.Date;
		/*
		var client = db_connector.connect(mysql);
		client.query("SELECT teradb.rollbook.Sno, teradb.rollbook.Date, teradb.lecture.Lday, teradb.lecture.Lperiod, teradb.rollbook.Stat, teradb.lecture.Lname, teradb.professor.Pname FROM teradb.rollbook JOIN teradb.lecture JOIN teradb.professor ON teradb.rollbook.Lno = teradb.lecture.Lno && teradb.lecture.Pid = teradb.professor.Pid WHERE Sno='"+id+"' ORDER BY teradb.rollbook.Date;", function(error, rows, cols) {
			if (error) {								// 서버측의 오류
				console.log('쿼리문의 오류..');
			} else if(rows.length <= 0 ){				// 클라이언트가 잘못된 정보를 입력.
				console.log('조회된 데이터가 없습니다.');
			} else {									// 성공시
				console.log(rows);
				send(rows);
			}
		});
		*/ // SELECT teradb.lecture.Lname FROM teradb.lecture JOIN teradb.enrol ON teradb.lecture.Lno = teradb.enrol.Lno WHERE Sno='20090022' GROUP BY teradb.lecture.Lname;
//		var client = db_connector.connect(mysql);
		
		client.query("SELECT teradb.rollbook.Stat, teradb.lecture.Lname, teradb.professor.Pname FROM teradb.rollbook JOIN teradb.lecture JOIN teradb.professor ON teradb.rollbook.Lno = teradb.lecture.Lno && teradb.lecture.Pid = teradb.professor.Pid WHERE Sno='"+id+"'", function(error, rows, cols) {
			if (error) {								// 서버측의 오류
				console.log('쿼리문의 오류..');
			} else if(rows.length <= 0 ){				// 클라이언트가 잘못된 정보를 입력.
				console.log('조회된 데이터가 없습니다.');
			} else {									// 성공시
//				console.log(rows);
				send(rows);
			}
		});
	});
	
	
	// SELECT teradb.rollbook.Stat, teradb.lecture.Lname FROM teradb.rollbook JOIN teradb.lecture JOIN teradb.professor ON teradb.rollbook.Lno = teradb.lecture.Lno && teradb.lecture.Pid = teradb.professor.Pid WHERE teradb.professor.Pid='F00026'
	// SELECT teradb.rollbook.Date, teradb.rollbook.Stat, teradb.lecture.Lname FROM teradb.rollbook JOIN teradb.lecture JOIN teradb.professor ON teradb.rollbook.Lno = teradb.lecture.Lno && teradb.lecture.Pid = teradb.professor.Pid WHERE teradb.professor.Pid='F00026'
	socket.on("requestCurrentProfessorAttendanceState", function(id, send){
		client.query("SELECT teradb.rollbook.Stat, teradb.lecture.Lname FROM teradb.rollbook JOIN teradb.lecture JOIN teradb.professor ON teradb.rollbook.Lno = teradb.lecture.Lno && teradb.lecture.Pid = teradb.professor.Pid WHERE teradb.professor.Pid='"+id+"'", function(error, rows, cols) {
			if (error) {								// 서버측의 오류
				console.log('쿼리문의 오류..');
			} else if(rows.length <= 0 ){				// 클라이언트가 잘못된 정보를 입력.
				console.log('조회된 데이터가 없습니다.');
			} else {									// 성공시
				console.log(rows);
				send(rows);
			}
		});
	});
	
	/* 아래부터는 고인이 된 코드 */
	socket.on("enterLectrooms", function(roomName){
		console.log(roomName.major+" 층 "+roomName.minor);//where Bmajor=1 AND Bminor=127;
		client.query("SELECT Rname FROM lectroom where Bmajor="+roomName.major+" AND Bminor="+roomName.minor, function(error,
				rows, cols) {
			if (error) {								// 서버측의 오류
				console.log('쿼리문의 오류..');
			} else if(rows.length <= 0 ){				// 클라이언트가 잘못된 정보를 입력.
				console.log('조회된 데이터가 없습니다.');
			} else {									// 성공시

				
				//SELECT * FROM lecture JOIN enrol ON enrol.Lno = lecture.Lno WHERE Rname='D229';
				client.query("SELECT * FROM lecture JOIN enrol ON enrol.Lno = lecture.Lno WHERE Lday='"
						+map.get(moment().format('dddd'))+"' AND Lperiod='"+map.get(ap+hour)+"';", function(error,
						rows, cols) {
					if (error) {								// 서버측의 오류
						console.log('쿼리문의 오류..');
					} else if(rows.length <= 0 ){				// 클라이언트가 잘못된 정보를 입력.
						console.log('조회된 데이터가 없습니다.');
					} else {									// 성공시
						socket.emit("responseLectroomInfos", rows);
						console.log(rows);
					}
				});
			}
		});
	});
	

	socket.on('requestLectureRecords', function(data){
		client.query("SELECT Lname,Dev FROM lecture where Lname='"+data+"' group by Dev", function(error,
				rows, cols) {
				var object = "[ { Lname: '"+rows[0].Lname+"', Records: "+rows.length+" } ]";
				socket.emit("responseLecturesRecords", object);
				console.log(object);
		});
	});
});

function getDay(mydate) { //mydate = 20010101 의 형식임. 
	var weekName = new Array('일', '월', '화', '수', '목', '금', '토');
	var year = mydate.substring(0, 4);
	var month = mydate.substring(4, 6);
	var day = mydate.substring(6, 8);
	var week = new Date(year, month - 1, day, 0, 0, 0, 0); //month는 0~11까지임 
	week = weekName[week.getDay()];

	return week;
}


