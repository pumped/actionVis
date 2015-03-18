var actionVis = function() {
	this.height = '100%';
	this.width = '100%';

	this.x = 500;
	this.y = 250;

	this.actionWidth = 50;
	this.actionSpacing = 5;
	this.actionSkip = this.actionWidth + this.actionSpacing;
	this.titlePadding = 20;
};

actionVis.prototype.setActionWidth = function(width) {
	this.actionWidth = width;
	this.actionSkip = this.actionWidth + this.actionSpacing;
}

actionVis.prototype.setData = function(data, island, years) {
	this.data = data;
	this.island = island;
	this.years = years;
};

actionVis.prototype.drawVis = function(element) {
	//setup
	this.element = element;

	var draw = this.draw = SVG(element).size(this.width,this.height)
								.attr("viewBox","0 0 "+this.x+" "+this.y);

	//resize & draw
	this.build();
}

actionVis.prototype._attachHandlers = function() { 
	console.log('handlers attached');
	$('.action-cell').mouseover(function(e){
		$(this).css({"opacity":0.8});
	});
	$('.action-cell').mouseout(function(e){
		$(this).css({"opacity":1});
	})
}

actionVis.prototype._drawChart = function() {

	draw = this.draw;

	var title = draw.text("Proposed Management Actions");
	title.font({
			size:12,
			anchor: 'middle'
		})
		.move(0,0)


    var plotGroup = draw.group();

    var yAxisLabels = plotGroup.group();
    var rowGroup = plotGroup.group();
    var rows = [];
    var row = 0;

    //for each threat on this island
    for (i in this.data[this.island]) {
    	var threatActions = this.data[this.island][i];
    	//console.log(threatActions);

    	rows[row] = this.drawRow(rowGroup,threatActions.data);
    	rows[row].move(0,row * 15);

    	this.drawYAxisRow(yAxisLabels,row,threatActions.threatName);
    	row++;
    }

    //add x axis
    var xAxisGroup = plotGroup.group();
    this.drawXAxis(xAxisGroup, this.years);

    //move matrix + xAxis next to labels
    var moveOver = yAxisLabels.bbox();
    rowGroup.move(moveOver.width + 20, 20+this.titlePadding);
    yAxisLabels.move(moveOver.width + 10,20+this.titlePadding);
    xAxisGroup.move(moveOver.width + 18 + this.actionSkip/2,10+this.titlePadding);


    //move title
    title.move(rowGroup.bbox().x2 - (rowGroup.bbox().width/2),0);

    b = draw.bbox();
    //console.log(b);
    draw.attr("viewBox",b.x+" "+b.y+" "+b.x2+" "+b.y2);

}

actionVis.prototype.drawXAxis = function(group, years) {
	for (var i =0; i<years; i++) {
		var text = group.text(i.toString())
						.move(i*this.actionSkip,0)
		text.font({
				size:8,
				anchor:'middle'
			})
	}

	//add title
	var bb = group.bbox();
	var title = group.text("year")
	title.font({
			size:10,
			anchor: 'middle'
		})
		.move(bb.width/2,-15);
}

actionVis.prototype.build = function() {
	var width = this.draw.parent.clientWidth;
	var rw = 50-((1100-width)/20);

	this.setActionWidth(rw);
	this.draw.clear();
	this._drawChart();

	this._attachHandlers();
}

actionVis.prototype.drawYAxisRow = function(group, i, label) {
	var text = group.text(label).move(0,(i*15 + 4))
	text.font({
		size:8,
		anchor: 'end'
	});
}

actionVis.prototype.drawRow = function(g,data) {
	var actionWidth = this.actionWidth;
	var actionSpacing = this.actionSpacing;
	var actionSkip = actionWidth + actionSpacing;
	var fill = ['#eee','#333'];

	//draw rows
	var rowGroup = g.group();
	for (i in data) {
		var action = rowGroup.rect(actionWidth,10)
			.attr({
				fill:fill[data[i]],
				stroke:'#fff',
				strokeWidth:1,
				class:"action-cell"
			})
			.move(i*actionSkip);
	}
	return rowGroup;
}
