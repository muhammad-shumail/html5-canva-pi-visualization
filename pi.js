window.requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();
var canvas = document.getElementById("visualize")
var ctx = canvas.getContext("2d");
var W = window.innerWidth;
var H = window.innerHeight;




var PI = "31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632788659361533818279682303019520353018529689957736225994138912497217752834791315155748572424541506959508295331168617278558890750983817546374649393192550604009277016711390098488240128583616035637076601047101819429555961989467678374494482553797747268471040475346462080466842590694912933136770289891521047521620569660240580381501935112533824300355876402474964732639141992726042699227967823547816360093417216412199245863150302861829745557067498385054945885869269956909272107975093029553211653449872027559602364806654991198818347977535663698074265425278625518184175746728909777727938000816470600161452491921732172147723501414419735685481613611573525521334757418494684385233239073941433345477624168625189835694855620992192221842725502542568876717904946016534668049886272327917860857843838279679766814541009538837863609506800642251252051173929848960841284886269456042419652850222106611863067442786220391949450471237137869609563643719172874677646575739624138908658326459958133904780275900"

var digitsToDisplay = PI.substring(0, 1500)


var colors = [
  "#FF0000",
  "#FF7F00",
  "#FFFF00",
  "#00FF00",
  "#0000FF",
  "#4B0082",
  "#8F00FF",
  "#FF0000",
  "#FF7F00",
  "#FFFF00"
];

var rotationOffset = -2.5 // in numbers

/* PARTS*/
var marginBetweenParts = 2 // in deg
var paddingCanvas = 60 // in px
var heightParts = 12 // in px

/* TEXT*/
var textOffset = 30 // in px

/* CONNECT*/
var lineWidth = .3 // in px



  ; (function () {
    var min = Math.min(W, H);
    W = min;
    H = min;
  })()

canvas.width = W
canvas.height = H

ctx.globalCompositeOperation = "lighter";
ctx.font = "normal 25px monospace";


function deg(d) { // to rad
  return d * (Math.PI / 180);
}


function drawBackground() {
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.fillStyle = "rgba(0, 0, 0, 1)";
  ctx.fill();
}

function drawSegments() {

  function text(n) {
    var newN = n + rotationOffset
    var length = H / 2 - paddingCanvas + textOffset
    var angle = deg(36 * newN + marginBetweenParts)
    var x = polar(angle, length).x
    var y = polar(angle, length).y
    x += W / 2
    y += H / 2
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(n, x, y);
  }

  function drawSegment(n, color) {
    var n = n + rotationOffset
    var angle1 = deg(36 * n + marginBetweenParts)
    var angle2 = deg(36 * (n + 1) - marginBetweenParts)
    var radius = H / 2 - paddingCanvas
    ctx.strokeStyle = "#FFFFFF"
    ctx.fillStyle = color
    ctx.lineWidth = 1
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, radius, angle1, angle2, false); // final argument is antiClockwise
    ctx.arc(W / 2, H / 2, radius - heightParts, angle2, angle1, true);
    ctx.arc(W / 2, H / 2, radius, angle1, angle1, false); // to beginpoint
    ctx.stroke();
    ctx.fill();
  }
  for (var i = 0; i < 10; i++) {
    drawSegment(i, colors[i])
    text(i)
  };
}

function polar(angle, length) { // to cart
  var x = length * Math.cos(angle)
  var y = length * Math.sin(angle)
  return { x: x, y: y }
}

function toCoord(n, iterationOffset) { // get coordinate
  var n = n + rotationOffset
  var length = H / 2 - paddingCanvas - heightParts - 2 - 5
  var angle = deg(36 * n + marginBetweenParts)
  if (iterationOffset) { angle += deg(iterationOffset * (36 - 2 * marginBetweenParts) / digitsToDisplay.length) }
  var x = polar(angle, length).x
  var y = polar(angle, length).y
  x += W / 2
  y += H / 2
  return { x: x, y: y, angle: angle, length: length }
}

function connect(from, to, iteration) {	// conect digits

  var coordFrom = toCoord(from, iteration)
  var coordTo = toCoord(to, iteration)

  var diffAngle = (coordTo.angle - coordFrom.angle + Math.PI * 2) % (Math.PI * 2)
  var quadraticControl = polar(coordFrom.angle + (diffAngle) / 2, 0.05 * W)

  ctx.strokeStyle = colors[from];
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(coordFrom.x, coordFrom.y);

  ctx.quadraticCurveTo(quadraticControl.x + W / 2, quadraticControl.y + H / 2, coordTo.x, coordTo.y);
  ctx.stroke();
}

function drawDigits(number) {
  var i = 0
  function draw() {
    connect(parseFloat(number[i]), parseFloat(number[i + 1]), i)
    if (i < number.length - 2) {
      i += 1
      requestAnimFrame(draw)
    }
  }
  draw()
}

drawBackground()
drawSegments()
drawDigits(digitsToDisplay)