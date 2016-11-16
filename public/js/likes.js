// jquery ajax form submit

<script type="text/javascript">
  $("#createbutton").submit(function(event) {
    event.preventDefault();
    var data = {};
    data.name = $('#nameinput').val();
    data.email = $('#emailinput').val();
    data.user = $('#usernameinput').val();
    data.pass = $('#passwordinput').val();
    $.ajax({
      type: 'POST',
      url: 'http://localhost:1111/user/create',
      data: data,
      dataType: 'application/json',
      success: function(data) {
        console.log('success');
        console.log(data);
      }
    });
  });
</script>