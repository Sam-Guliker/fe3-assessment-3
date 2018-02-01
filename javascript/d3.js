/* Selecteerd de ID en maakt een svg*/
var svgBar = d3.select("#barchart"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svgBar.attr("width") - margin.left - margin.right,
    height = +svgBar.attr("height") - margin.top - margin.bottom;

/*  Scaleband word een nieuwe bandiwdth op de x as gemaakt  https://github.com/d3/d3-scale/blob/master/README.md#scaleBand */
/* scaleLinear is een continious scale */
var xBar = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    yBar = d3.scaleLinear().rangeRound([height, 0]);

var gBar = svgBar.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svgPie = d3.select("#piechart"),
    widthPie = +svgPie.attr("width"),
    heightPie = +svgPie.attr("height"),
    radius = Math.min(widthPie, heightPie) / 2,
    gPie = svgPie.append("g").attr("transform", "translate(" + widthPie / 2 + "," + heightPie / 2 + ")");

/* Ordinal scale is niet zoals een domain je zet de kleuren bijvoorbeeld vast https://github.com/d3/d3-scale/blob/master/README.md#scaleOrdinal*/
var color = d3.scaleOrdinal(["#FFC636", "#FF6444"]);

var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.total_litres_of_pure_alcohol_servings; });

var pathPie = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var labelPie = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);

/* laad de data in*/
d3.csv("data/drinks.csv", function(drinks) {
  drinks.total_litres_of_pure_alcohol_servings =+drinks.total_litres_of_pure_alcohol_servings;
  drinks.beer_servings =+drinks.beer_servings;
  drinks.spirit_servings =+drinks.spirit_servings;
  drinks.wine_servings =+drinks.wine_servings;
  return drinks;
}, function(error, data) {
  if (error) throw error;

  /* De sort functies zorgen ervoor dat de hoogste getallen naar boven komen.
   Met slice maak ik nieuwe array's, zodat de data niet aangepast wordt. */
  beerData = data.sort(function(a, b){
    return parseFloat(b.beer_servings) - parseFloat(a.beer_servings);
  }).slice(0);

  wineData = data.sort(function(a, b){
    return parseFloat(b.wine_servings) - parseFloat(a.wine_servings);
  }).slice(0);

  totalAlc = data.sort(function(a, b){
    return parseFloat(b.total_litres_of_pure_alcohol_servings) - parseFloat(a.total_litres_of_pure_alcohol_servings);
  }).slice(0);

  /* Pakt de top 5 uit de data. */
  cleanedBeer = beerData.splice(0,5)
  cleanedWine = wineData.splice(0,5)
  cleanedTotal = totalAlc.splice(0,5)

  /* Zorgt ervoor dat de juiste data word gebruikt voor de x en y as. */
  xBar.domain(cleanedBeer.map(function(cleanedBeer) {
        return cleanedBeer.country;
    }));

  /* de d3.max kijkt naar de hoogste waarde uit de data en gebruikt het. */
  yBar.domain([0, d3.max(cleanedBeer, function(cleanedBeer) {
      return cleanedBeer.beer_servings;
  })]);


  /* Geeft de groepeerde attributen in svgBar nog meer attributen */

  /* x as voor de barchart */
  gBar.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xBar));

  /* add een label aan de rechter kant */
  gBar.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Gallons");

  /* y as voor de barchart */
  gBar.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(yBar).ticks(10))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")

/* add een label aan de bottom */
  gBar.append("text")
    .attr("transform",
          "translate(" + (width/2) + " ," +
                         (height + margin.top + 0) + ")")
    .style("text-anchor", "middle")
    .text("Landen");

  /*Voegt data en attributen toe aan alle bars in mijn svgBar*/
  gBar.selectAll(".bar")
    .data(cleanedBeer)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(cleanedBeer) {
         return xBar(cleanedBeer.country);
       })
      .attr("y", function(cleanedBeer) {
        return yBar(cleanedBeer.beer_servings);
       })
      .attr("width", xBar.bandwidth())
      .attr("height", function(cleanedBeer) {
        return height - yBar(cleanedBeer.beer_servings);
      })

    /* hover state */
    .on("mouseover", function(d) {
      handleMouseOver([{
        value: d.beer_servings
      },
      {
        value: d.wine_servings
      }])
    })

    var arc = gPie.selectAll(".arc")
    .data(pie(data))
    .enter().append("g")
      .attr("class", "arc");

    arc.append("path")
    arc.append("text")

 /* Update functie */
    function handleMouseOver(data){
      var pie = d3.pie()
          .sort(null)
          .value(function(d) {return d.value;});

      var arc = gPie.selectAll(".arc")
        .data(pie(data))

      arc.enter()
        .append("g")
        .attr("class", "arc")

      arc.select("path")
        .transition()
        .duration(500)
        .attr("d", function(d) {
          return pathPie(d)
        } )
        .attr("fill", function(d) {
          return color(d.value);
        });

      arc.select("text")
          .attr("transform", function(d) { return "translate(" + labelPie.centroid(d) + ")"; })
          .attr("dy", "0.35em")
          .text(function(d) {
            return d.value + ' G';
          });

      arc.exit().remove()

    }
});
