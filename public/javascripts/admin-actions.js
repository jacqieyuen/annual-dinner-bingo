$(function () {
    var socket        = io();
    $(document).on("click", "a", function() {
    if (confirm('Are you sure you want to restart the server')) {
		socket.emit("end server")    }
	});
	   // socket.emit("get winner array");
	    // socket.on("send winner array", function(data){
        // console.log(data);
        // for(var i = 0; i < data.length; i++){
        //   $('ul#winner-list').append('<li>'+data[i]+'</li>')
        // }
      // });

});