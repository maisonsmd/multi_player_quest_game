(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{253:function(t,n,e){t.exports=e.p+"img/background.2c6bfab.png"},264:function(t,n){},268:function(t,n,e){var content=e(320);"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,e(66).default)("1b7833da",content,!0,{sourceMap:!1})},319:function(t,n,e){"use strict";var o=e(268);e.n(o).a},320:function(t,n,e){var o=e(65),r=e(266),c=e(253);n=o(!1);var l=r(c);n.push([t.i,".container-fluid{margin:0 auto;min-height:100vh;display:flex;justify-content:center;align-items:center;text-align:center}.field-label{color:#fff;padding:0;margin:0;text-align:left}body{background-color:#eceff1!important;background:url("+l+");background-repeat:no-repeat;background-size:cover;background-position:50%}",""]),t.exports=n},323:function(t,n,e){"use strict";e.r(n);e(104),e(29),e(13),e(19),e(36);var o=e(258),r=e.n(o),c=e(80),l=e.n(c),h={name:"index",data:function(){return{host:"",connected:!1,socket:null,alert:{dismiss_countdown:0,message:""},stopwatch:{running:!1,start:0,interval_timer:-1,string:"0:00.00"},score:0,answer_text:"",team_index:-1,has_focus:!1,btn_variant:{a:"outline-light",b:"outline-light",c:"outline-light",d:"outline-light",quick_take:"outline-light"},light_trigger_sound:new Audio("light_trigger.mp3")}},created:function(){var t=this;if(this.host="http://".concat(window.location.hostname,":3001"),document.title="loading",this.team_index=+(this.$route.query.team||0)-1,this.team_index<0||this.team_index>=6)for(;;){var input=prompt("số thứ tự của đội? (1-6)");if((input=+input)>=1&&input<=6){this.team_index=input-1,document.title="ĐỘI "+input,this.$router.push({path:"#",query:{team:this.team_index+1}});break}}document.title="ĐỘI "+(this.team_index+1),this.init_socket(),document.onkeydown=function(n){if(n.shiftKey||n.altKey||n.SHIFTKey)switch(["1","2","3","4"," ","!","@","#","$"].includes(n.key)&&n.SHIFTKey&&n.preventDefault(),n.key){case"1":case"!":t.send_quick_answer("A"),t.btn_variant.a="light",setTimeout((function(){return t.btn_variant.a="outline-light"}),100);break;case"2":case"@":t.send_quick_answer("B"),t.btn_variant.b="light",setTimeout((function(){return t.btn_variant.b="outline-light"}),100);break;case"3":case"#":t.send_quick_answer("C"),t.btn_variant.c="light",setTimeout((function(){return t.btn_variant.c="outline-light"}),100);break;case"4":case"$":t.send_quick_answer("D"),t.btn_variant.d="light",setTimeout((function(){return t.btn_variant.d="outline-light"}),100);break;case" ":t.quick_take(),t.btn_variant.quick_take="light",setTimeout((function(){return t.btn_variant.quick_take="outline-light"}),100)}},document.hasFocus()&&(this.has_focus=!0),window.onfocus=function(){setTimeout((function(){return t.has_focus=!0}),200)},window.onblur=function(){t.has_focus=!1},this.request_stopwatch(),l.a.get("".concat(this.host,"/players_display")).then((function(n){var e=n.data[t.team_index];t.score=e.score}))},methods:{convert_to_time_string:function(t){var dt=new Date(t),n=dt.toLocaleTimeString().toLowerCase(),time=n.substring(n.indexOf(":")+(dt.getMinutes()<10?2:1),n.length),e=dt.getMilliseconds(),o=""+e;return o=e<10?"0"+o:o.substring(0,2),time.replace(/ (am|pm)/,".")+o},send_quick_answer:function(t){this.stopwatch.running?this.show_alert("Đáp án đầu tiên sẽ được ghi nhận!"):this.show_alert("Chưa được phép trả lời!"),this.socket.emit("answer",{team:this.team_index,answer:t}),this.btn_variant.a="outline-light",this.btn_variant.b="outline-light",this.btn_variant.c="outline-light",this.btn_variant.d="outline-light"},quick_take:function(){this.socket.emit("quick_take",this.team_index)},send_input:function(){var input=this.answer_text;this.stopwatch.running?(this.show_alert("Đáp án đầu tiên sẽ được ghi nhận!"),this.answer_text=""):this.show_alert("Chưa được phép trả lời!"),input&&(this.socket.emit("answer",{team:this.team_index,answer:input}),this.btn_variant.a="outline-light",this.btn_variant.b="outline-light",this.btn_variant.c="outline-light",this.btn_variant.d="outline-light")},init_socket:function(){var t=this;this.socket=r.a.connect(this.host),this.socket.on("connect",(function(){t.connected=!0,console.log("connected")})),this.socket.on("stopwatch_start",(function(data){t.stopwatch.start=Date.now(),t.stopwatch.running=!0,t.btn_variant.a="success",t.btn_variant.b="success",t.btn_variant.c="success",t.btn_variant.d="success"})),this.socket.on("stopwatch_stop",(function(data){t.stopwatch.running?(t.stopwatch.string=t.convert_to_time_string(data),t.stopwatch.running=!1,t.btn_variant.a="outline-light",t.btn_variant.b="outline-light",t.btn_variant.c="outline-light",t.btn_variant.d="outline-light"):t.stopwatch.string=t.convert_to_time_string(0)})),this.socket.on("disconnect",(function(){t.connected=!1,console.log("disconnected")})),this.socket.on("bell",(function(n){n.waiting?t.btn_variant.quick_take="danger":(t.btn_variant.quick_take="outline-light",n.team==t.team_index&&(t.show_alert("Bạn được phép trả lời!"),t.light_trigger_sound.currentTime=.1,t.light_trigger_sound.play()))})),this.socket.on("update",(function(p){var n=p[t.team_index];n.answered&&(t.stopwatch.running=!1,t.stopwatch.string=t.convert_to_time_string(n.time_of_answer))})),this.socket.on("update_display",(function(n){var e=n[t.team_index];t.score=e.score})),this.stopwatch.interval_timer=setInterval((function(){t.stopwatch.running&&(t.stopwatch.string=t.convert_to_time_string(Date.now()-t.stopwatch.start))}),100)},request_stopwatch:function(){var t=this;l.a.get("".concat(this.host,"/stopwatch")).then((function(n){var e=n.data.players[t.team_index];t.stopwatch.start=Date.now()-n.data.stopwatch.elapsed,e.answered?(t.stopwatch.running=!1,t.stopwatch.string=t.convert_to_time_string(e.time_of_answer)):(t.stopwatch.running=n.data.stopwatch.running,t.stopwatch.running&&(t.btn_variant.a="success",t.btn_variant.b="success",t.btn_variant.c="success",t.btn_variant.d="success"))}))},alert_countdown_changed:function(t){this.alert.dismiss_countdown=t},show_alert:function(t){this.alert.dismiss_countdown=2,this.alert.message=t}}},_=(e(319),e(62)),component=Object(_.a)(h,(function(){var t=this,n=t.$createElement,e=t._self._c||n;return e("b-container",{attrs:{fluid:""}},[e("b-alert",{staticStyle:{"max-width":"300px",position:"fixed",top:"10px",left:"10px","z-index":"98"},attrs:{show:t.alert.dismiss_countdown,fade:"",variant:"warning"},on:{"dismiss-count-down":t.alert_countdown_changed}},[t._v(t._s(t.alert.message)+"\n  ")]),t._v(" "),t.connected?t._e():e("b-alert",{staticClass:"text-uppercase font-weight-bold",staticStyle:{"max-width":"300px",position:"fixed",top:"10px",left:"10px","z-index":"99"},attrs:{variant:"danger",show:"",fade:""}},[t._v("\n    lost connection!")]),t._v(" "),e("div",{staticClass:"w-100"},[t.has_focus?e("div",[e("b-row",[e("b-col",{staticClass:"text-white text-uppercase text-left",attrs:{sm:"4"}},[e("h1",[t._v("đội "+t._s(this.team_index+1))])]),t._v(" "),e("b-col",{staticClass:"text-white text-uppercase text-center",attrs:{sm:"4"}},[e("h1",[t._v("điểm: "+t._s(this.score))])]),t._v(" "),e("b-col",{staticClass:"text-white text-right text-monospace",attrs:{sm:"4"}},[e("h1",{staticClass:"text-uppercase text-white"},[t._v("\n            "+t._s(this.stopwatch.string)+"\n          ")])])],1),t._v(" "),e("b-row",[e("b-col",{attrs:{sm:"8"}},[e("b-row",[e("b-input",{ref:"answerInput",staticClass:"text-weight-bold ml-3 mr-3",attrs:{autocomplete:"off",placeholder:"Nhập kết quả và nhấn ENTER",size:"lg",id:"answer-input"},on:{keydown:function(n){return!n.type.indexOf("key")&&t._k(n.keyCode,"enter",13,n.key,"Enter")?null:t.send_input(n)}},model:{value:t.answer_text,callback:function(n){t.answer_text=n},expression:"answer_text"}})],1),t._v(" "),e("b-row",{staticClass:"mt-4",attrs:{"align-h":"center"}},[e("b-col",{attrs:{sm:"3"}},[e("b-button",{staticClass:"w-100",attrs:{variant:t.btn_variant.a},on:{click:function(n){return t.send_quick_answer("A")}}},[t._v("A "),e("br"),t._v("(SHIFT+1)")])],1),t._v(" "),e("b-col",{attrs:{sm:"3"}},[e("b-button",{staticClass:"w-100",attrs:{variant:t.btn_variant.b},on:{click:function(n){return t.send_quick_answer("B")}}},[t._v("B "),e("br"),t._v("(SHIFT+2)")])],1),t._v(" "),e("b-col",{attrs:{sm:"3"}},[e("b-button",{staticClass:"w-100",attrs:{id:"answer-c",variant:t.btn_variant.c},on:{click:function(n){return t.send_quick_answer("C")}}},[t._v("C "),e("br"),t._v("(SHIFT+3)")])],1),t._v(" "),e("b-col",{attrs:{sm:"3"}},[e("b-button",{staticClass:"w-100",attrs:{variant:t.btn_variant.d},on:{click:function(n){return t.send_quick_answer("D")}}},[t._v("D "),e("br"),t._v("(SHIFT+4)")])],1)],1)],1),t._v(" "),e("b-col",{attrs:{sm:"4"}},[e("b-button",{staticClass:"h-100 w-100 text-uppercase",attrs:{size:"lg",variant:t.btn_variant.quick_take},on:{click:t.quick_take}},[t._v("giành quyền trả lời"),e("br"),t._v("(SHIFT+SPACE)")])],1)],1)],1):e("div",[e("h1",{staticClass:"text-uppercase text-white"},[t._v("LOST FOCUS!")]),t._v(" "),e("h3",{staticClass:"text-uppercase text-white"},[t._v("click vào đây để trả lời!")])])])],1)}),[],!1,null,null,null);n.default=component.exports}}]);