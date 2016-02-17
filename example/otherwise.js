var space = 'otherwise';
ROUTER.addEvent(space, {
  init: function(scope){
    scope.abc = 'default';
    console.log(666);
  },
  load: function(){
    console.log(555);
    EXCEL && EXCEL.begin(space);
  }
});
EXCEL.addPage(space, {
  'A1': 'abcde',
  'A2': '="hello otherwise "+A1+E.A2+E.A3+" page!"'
});
console.log(777);