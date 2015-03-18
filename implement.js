
$( document ).ready(function(){
	d = new dataShim();

	d.addData(features, threats, chromosome, lookup, F, features_threats);




	 d.getIslandActions();
	 a = new actionVis();
	 a.setData(d.getIslandActions(), 2, d.years);
	 a.drawVis("actionVis");

	 $(window).on('resize', function() { a.build(); });
});