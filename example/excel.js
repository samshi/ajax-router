function bindL2R(local, remote){
  observe(space, function(value){
    var obj     = {};
    obj[remote] = value;
    ref.update(obj);
  }, new RegExp(local));
}
function bindR2L(remote, local){
  ref.on('value', function(data, prev){
    window[space][local] = data.val()[remote];
    EXCEL.update(local);
  });
}
function bindR2L_old(remote, local){
  ref.child(remote).on('child_changed', function(data, prev){
    console.log(data.key(), data, data.val(), prev);
    window[space][local] = data.val();
    EXCEL.update(local);
  });
}

function changeString(){
  //TT = $.MS();
  EXCEL.update('B20', (new Date).toISOString());
}

