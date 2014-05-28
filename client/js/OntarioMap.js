
/* Set height and width of app on screen */
var width = 640,
    height = 500;
    active = d3.select(null);

var svg = d3.select("body").select("#container").append("svg")
    .attr("width", width)
    .attr("height", height);
    
  
svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);        //if you click on the background it zooms out



/* Set initial location and size of Ontario map */
/* TO DO: set bounds automatically, rather than hardcoding */
var projection = d3.geo.mercator()
    .scale(1750)
    .translate([2905, 1900]);

var path = d3.geo.path()
    .projection(projection);

//The SVG 'g' object for the maps
var g = svg.append("g")
    .style("stroke-width", "1.5px");

var tooltip = d3.select("#container").append("div").attr("class", "tooltip hidden");
var bdoverlay;

//Sets up loading screen
var loadingScreen = d3.select("body").append("div").attr("class", "loadingScreen")
function loading() {
    loadingScreen.html("Loading...");
    //loadingScreen.html("<img src='img/spinner.gif' alt='Loading...' height='42' width='42'>");
}
loading();

//Queues map and board name data
queue()
    .defer(d3.json, "data/simpleon.json")
    .defer(d3.csv, "data/boards.csv")
    .await(ready);

function ready (error, on, bdList) {
    
    d3.select(".boardSelector").select("select").selectAll("option")
        .data(bdList)
        .enter()
        .append("option")
        .text(function (d) { return d.DSBName;} )
        .attr("value", function (d) { return d.DSBNo;} );
    
    g.append("path")
        .datum({type: "FeatureCollection", features: topojson.feature(on, on.objects.layer1).features})
        .attr("d", path)
        .attr("class", "onmap");
    
    //Add map overlay
    overlay("ep");
}


function overlay(boardtype) {
    d3.json("data/" + boardtype + "_simple.json", function(error, bd) {
        
        bdoverlay = g.append("g");
        
        var board = bdoverlay.selectAll("path")
            .data(topojson.feature(bd, bd.objects.layer1).features);
            
        board.enter().append("path")
            .attr("d", path)
            .attr("class", "overlay "+ boardtype)
            .attr("id", function(d,i) { return d.properties.SDSB_ID; })
            .attr("title", function(d,i) { return d.properties.NAME; })
            .on("click", clicked)
        
        bdoverlay.append("path")
            .datum(topojson.mesh(bd, bd.objects.layer1))
            .attr("class", "mesh")
            .attr("d", path);
            
        
        //Resets loading screen text to blank
        loadingScreen.html("");
        
        
                //Tooltips
        
        //offsets for tooltips
        var offsetL = document.getElementById('container').offsetLeft+20;
        var offsetT = document.getElementById('container').offsetTop+10;
        
        //tooltips
        board
            .on("mousemove", function(d,i) {
        
            var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
        
            tooltip.classed("hidden", false)
                 .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
                 .html(d.properties.NAME);
            
            })
                .on("mouseout",  function(d,i) {
                tooltip.classed("hidden", true);
            }); 

    });
}

function selectBoardType() {
    var list=document.getElementById("boardType");
    var selection = list.options[list.selectedIndex].value;


    bdoverlay.remove();
    reset();
    loading();
    overlay(selection);
}

function selectBoard() {
    var list=document.getElementById("board");
    var selection = list.options[list.selectedIndex].value;

    var selectionId = "#" + selection;

    var name = d3.select("path").attr("id");
    alert(name);

}


function clicked(d) {
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .5 / Math.max(dx / width, dy / height),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

  g.transition()
      .duration(750)
      .style("stroke-width", 1.5 / scale + "px")
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  g.transition()
      .duration(750)
      .style("stroke-width", "1.5px")
      .attr("transform", "");
}
