class Idom {
    margin = {
        top: 150, right: 400, bottom: 80, left: 100
    }


    constructor(svg, data, width = 200, height = 200) {
        this.svg = svg;
        this.data = data;
        this.width = width;
        this.height = height;
        this.returnValue;
        this.arcIndex = 0;
        this.piedata;
        this.event;
        this.container_;

        this.handlers = {}
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.container = this.svg.append("g");
        var level_data = [0,0,0,0];
        var legend_data =["I", "P", "G", "D"];


        for (var i = 0; i<this.data.length; i++){
            if(data[i].tourney_level == 'I')
                level_data[0]++;
            else if (data[i].tourney_level == "P")
                level_data[1]++;
            else if (data[i].tourney_level == "G")
                level_data[2]++;
            else if (data[i].tourney_level == "D")
                level_data[3]++;
        }

        const final_data = [
            {name: 'I', value: level_data[0], color:"#fcccd4"},
            {name: 'P', value: level_data[1], color:"#fbdea2"},
            {name: 'G', value: level_data[2], color:"#f2ecc6"},
            {name: 'D', value: level_data[3], color:"#8eb695"}
        ];

        this.piedata = final_data;

        const radius = Math.min(this.width, this.height)/2;

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .style("border", "1px solid rgba(0,0,0,0,1)");

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        const color = d3.scaleOrdinal([
            "#fcccd4",
            "#fbdea2",
            "#f2ecc6",
            "#8eb695",
        ]);

        const pie = d3.pie()
            .sort((a, b) => b.value - a.value)
            .value(d => d.value);

        const arc = d3.arc().innerRadius(50).outerRadius(radius);
        const arcs = this.container
            .selectAll("arc")
            .data(pie(final_data))
            .enter()
            .append("g")
            .attr("class", "arc")
            .on("mouseover", onMouseOver)
            .on("mouseout", onMouseOut)
            .on("click", (event, i) => {
                this.event = event;
                this.arcIndex = i;
                console.log(this.arcIndex);
                this.clickEvent(event, i, final_data);
            });
        arcs
            .append("path")
            .attr("fill", (d, i) => color(i))
            .attr("d", arc);

        arcs
            .append("text")
            .attr("transform", (d) => `translate(${arc.centroid(d)})`)
            .text((d) => d.value)
            .attr("font-family", "sans-serif")
            .attr("font-size", "18px")
            .attr("font-weight", "bold")
            .attr("fill", "#fff")
            .attr("text-anchor", "middle")
            .attr("display", "none");

        var legend = this.svg.append("g")
            .attr("text-anchor","end")
            .selectAll("g")
            .data(legend_data)
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(50," + i * 20 + ")"; });
        
        legend.append("rect")
            .attr("x", this.width - 20)
            .attr("y", 200)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", color);

        legend.append("text")
            .attr("x", this.width - 30)
            .attr("y", 210)
            .attr("dy", "0.32em")
            .attr("font-size", "13px")
            .attr("font-family", "sans-serif")
            .attr("text-anchor", "left")
            .text(function(d) { return d; });

        function onMouseOut(d, i){
            d3.select(this)
                .select("path")
                .transition()
                .duration(200)
                .style("fill", color(i));
            d3.select(this).select("text").attr("display","none");
        }

        function onMouseOver(d, i){
            d3.select(this)
                .select("path")
                .transition()
                .duration(200)
                .style("fill", "#fb9da7");
            d3.select(this).select("text").attr("display", "block");
        }
    }

    clickInit(){
        console.log("clinckInit");
        this.clickEvent(this.event, this.arcIndex, this.piedata)
    }

    clickEvent(event, i, final_data){
        console.log(i);
        var Cval = document.getElementsByClassName("arc")[i].textContent;
        var Cname = final_data[i].name;
        var CColor = final_data[i].color;

        var clickVar = [{name:Cname, value:Cval, color:CColor}];
        //console.log(clickVar);
        
        let eventData = clickVar;
        let xVar = d3.select("input[type=radio][name=x-encoding]:checked").property("value");
        
        
        if (xVar == "winner_ht"){
            var returnValue = [{key: xVar, value:clickVar}];
            const div = document.getElementById('boxplot');
            div.remove();
            this.BoxPlotEvent(returnValue);
        }
        else if (xVar == "minutes"){
            var returnValue = [{key: xVar, value:clickVar}];
            const div = document.getElementById('boxplot');
            div.remove();
            this.BoxPlotEvent(returnValue);
        }
        else if (xVar == "Preferred Hand"){
            var returnValue = [{key: xVar, value:clickVar}];
            const div = document.getElementById('boxplot');
            div.remove();
            this.BarChartEvent(returnValue);
        }
    }

    BarChartEvent(returnValue){

        var WRcount = 0;
        var WLcount = 0;
        var LRcount = 0;
        var LLcount = 0;

        for (var i = 0; i<this.data.length; i++){
            if(data[i].tourney_level == returnValue[0].value[0].name){
                if (data[i].winner_hand == "R")
                    WRcount++;
                if(data[i].winner_hand == "L")
                    WLcount++;
                if(data[i].loser_hand == "R")
                    LRcount++;
                if(data[i].loser_hand == "L")
                    LLcount++;
            }
        }

        var handData = [WRcount, LRcount, WLcount, LLcount];
        console.log(handData);

        var categories = ["WR", "LR", "WL" ,"LL"];
        var boxmargin = {top: 10, right: 30, bottom: 30, left: 600},
        boxwidth = 780 - boxmargin.left - boxmargin.right,
        boxheight = 400 - boxmargin.top - boxmargin.bottom;

        var svg = d3.select("svg")
            .append("svg")
            .attr("id", "boxplot")
            .attr("width", boxwidth + boxmargin.left + boxmargin.right)
            .attr("height", boxheight + boxmargin.top + boxmargin.bottom)
            .attr("transform",
                "translate(" + boxmargin.left + "," + boxmargin.top + ")");

        var container = svg.append("g");
        var legend = svg.append("g");

        const svgWidth = 300, svgHeight = 300;
        const padding = 30;

        const xAxisScale = d3
            .scaleBand()
            .domain(categories)
            .range([padding, svgWidth - padding])
            .padding(0,2);

        const xAxis = d3.axisBottom().scale(xAxisScale);

        const yAxisScale = d3
            .scaleLinear()
            .domain([0, d3.max(handData)])
            .range([svgHeight - padding, padding]);

        const yAxis = d3.axisLeft().scale(yAxisScale);
        const xAxisTranslate = svgWidth - padding + 30;
        svg.append("g").attr("class", "x-axis").call(xAxis).attr("transform", `translate(400, ${xAxisTranslate})`);
        svg.append("g").attr("class", "y-axis").call(yAxis).attr("transform", `translate(${padding+400}, 30)`);
        svg.append("g").attr("class", "val");

        svg
            .selectAll("rect")
            .data(handData)
            .enter()
            .append("rect")
            .attr("height", (d) => svgHeight - yAxisScale(d) - padding)
            .attr("width", xAxisScale.bandwidth()-30)
            .attr("transform", (d, i) => `translate(${padding+415 + 60*i}, 30)`)
            .attr("x", (d, i) => xAxisScale(i)+7)
            .attr("y", (d) => yAxisScale(d))
            .attr("fill", returnValue[0].value[0].color)
            .on("mouseover", onMouseOver)
            .on("mouseout", onMouseOut);
            
        svg.select(".val")
            .selectAll("text")
            .data(handData)
            .enter()
            .append("text")
            .attr("x", (d,i) => xAxisScale(i) + 7 + (xAxisScale.bandwidth() / 2))
            .attr('y', d => yAxisScale(d))
            .attr("transform", (d, i) => `translate(${padding+430 + 60 * i}, 28)`)
            .text(d => d)
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .attr("display", "none");

        function onMouseOut(d,i){
            d3.select(this)
             .transition()
                .duration(400)
                .style("fill", returnValue[0].value[0].color);
            d3.select('.val')
                .selectAll("text").filter((d,index) => index === i)
                .attr("display", "none");
        }

        function onMouseOver(d,i){
            d3.select(this)
                .transition()
                .duration(400)
                .style("fill", "grey");
            d3.select('.val')
                .selectAll("text").filter((d,index) => index === i)
                .attr("display", "block");
        }

    }

    BoxPlotInitialize(){
        var boxmargin = {top: 10, right: 30, bottom: 30, left: 400},
        boxwidth = 780 - boxmargin.left - boxmargin.right,
        boxheight = 400 - boxmargin.top - boxmargin.bottom;

        var svg = d3.select("svg")
            .append("svg")
            .attr("id", "boxplot")
            .attr("width", boxwidth + boxmargin.left + boxmargin.right)
            .attr("height", boxheight + boxmargin.top + boxmargin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + boxmargin.left + "," + boxmargin.top + ")");
    
        
        var dataSet = [];
        var dataSet_ = [];
        for(var i = 0; i<data.length; i++){
            if(data[i].tourney_level == "I")
                dataSet.push(data[i].winner_ht);
        }

        for(var i = 0; i<data.length; i++){
            if(data[i].tourney_level == "I")
                dataSet_.push(data[i].loser_ht);
        }
        
        var data_sorted = dataSet.sort(d3.ascending);
        var q1 = d3.quantile(data_sorted, .25);
        var median = d3.quantile(data_sorted, .5);
        var q3 = d3.quantile(data_sorted, .75);
        var end = d3.quantile(data_sorted, .99)
        var interQuantileRange = q3 - q1
        var in_min = q1 - 1.5 * interQuantileRange;
        var in_max = q3 + 1.5 * interQuantileRange;

        var data_sorted_ = dataSet_.sort(d3.ascending);
        var q1_ = d3.quantile(data_sorted_, .25);
        var median_ = d3.quantile(data_sorted_, .5);
        var q3_ = d3.quantile(data_sorted_, .75);
        var end_ = d3.quantile(data_sorted_, .99)
        var interQuantileRange_ = q3_ - q1_
        var in_min_ = q1 - 1.5 * interQuantileRange;
        var in_max_ = q3 + 1.5 * interQuantileRange;

        var max = -1
        var min = 300

        for (var i = 0; i<dataSet.length; i++){
            if(dataSet[i] > max && dataSet[i] < in_max)
                max = dataSet[i];
            if (dataSet[i] < min && dataSet[i] > in_min)
                min = dataSet[i];
        }

        var max_ = -1
        var min_ = 300

        for (var i = 0; i<dataSet_.length; i++){
            if(dataSet_[i] > max_ && dataSet_[i] < in_max_)
                max_ = dataSet_[i];
            if (dataSet_[i] < min_ && dataSet_[i] > in_min_)
                min_ = dataSet_[i];
        }

        var y = d3.scaleLinear()
            .domain([min_-10, end+10])
            .range([boxheight, 0]);
            
        svg.call(d3.axisLeft(y))

        var x = d3.scaleBand()
            .range([0, boxwidth])
            .domain(["Winner Height", "Loser Height"])
            .paddingInner(1)
            .paddingOuter(.7)

        svg.append("g")
            .attr("transform", "translate(0," + boxheight + ")")
            .call(d3.axisBottom(x))

        // a few features for the box
        var center = 100
        var width = 70
        
        // Show the main vertical line
        svg
            .append("line")
            .attr("x1", center)
            .attr("x2", center)
            .attr("y1", y(min) )
            .attr("y2", y(max) )
            .attr("stroke-width", 2)
            .attr("stroke", "black")
        
        // Show the box
        svg
            .append("rect")
            .attr("x", center - width/2)
            .attr("y", y(q3) )
            .attr("height", (y(q1)-y(q3)) )
            .attr("width", width )
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .style("fill", "#fcccd4")

        var center_ = 240
        var width_ = 70

        svg
        .append("line")
        .attr("x1", center_)
        .attr("x2", center_)
        .attr("y1", y(min_) )
        .attr("y2", y(max_) )
        .attr("stroke-width", 2)
        .attr("stroke", "black")
    
    // Show the box
    svg
        .append("rect")
        .attr("x", center_ - width_/2)
        .attr("y", y(q3_) )
        .attr("height", (y(q1_)-y(q3_)) )
        .attr("width", width_ )
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .style("fill", "#fcccd4")
        
        // show median, min and max horizontal lines
        svg
            .selectAll("horizontal_lines")
            .data([min, median, max])
            .enter()
            .append("line")
            .attr("x1", center-width/2)
            .attr("x2", center+width/2)
            .attr("y1", function(d){ return(y(d))} )
            .attr("y2", function(d){ return(y(d))} )
            .attr("stroke", "black")
            .attr("stroke-width", 2)

        svg
            .selectAll("horizontal_lines")
            .data([min_, median_, max_])
            .enter()
            .append("line")
            .attr("x1", center_-width_/2)
            .attr("x2", center_+width_/2)
            .attr("y1", function(d){ return(y(d))} )
            .attr("y2", function(d){ return(y(d))} )
            .attr("stroke", "black")
            .attr("stroke-width", 2)
    }
  
    BoxPlotEvent(returnValue){
        if(returnValue[0].key == "winner_ht"){
            var boxmargin = {top: 10, right: 30, bottom: 30, left: 400},
            boxwidth = 780 - boxmargin.left - boxmargin.right,
            boxheight = 400 - boxmargin.top - boxmargin.bottom;
    
            var svg = d3.select("svg")
                .append("svg")
                .attr("id", "boxplot")
                .attr("width", boxwidth + boxmargin.left + boxmargin.right)
                .attr("height", boxheight + boxmargin.top + boxmargin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + boxmargin.left + "," + boxmargin.top + ")");
    
            
            var dataSet = [];
            var dataSet_ = [];
            for(var i = 0; i<data.length; i++){
                if(data[i].tourney_level == returnValue[0].value[0].name)
                    dataSet.push(data[i].winner_ht);
            }

            for (var i=0; i<dataSet.length; i++){
                if (dataSet[i] === 0){
                    dataSet.splice(i,1);
                    i--;
                }
            }
    
            for(var i = 0; i<data.length; i++){
                if(data[i].tourney_level == returnValue[0].value[0].name)
                    dataSet_.push(data[i].loser_ht);
            }

            for (var i=0; i<dataSet_.length; i++){
                if (dataSet_[i] === 0){
                    dataSet_.splice(i,1);
                    i--;
                }
            }
            
            var data_sorted = dataSet.sort(d3.ascending);
            var q1 = d3.quantile(data_sorted, .25);
            var median = d3.quantile(data_sorted, .5);
            var q3 = d3.quantile(data_sorted, .75);
            var end = d3.quantile(data_sorted, .99)
            var interQuantileRange = q3 - q1
            var in_min = q1 - 1.5 * interQuantileRange;
            var in_max = q3 + 1.5 * interQuantileRange;
    
            var data_sorted_ = dataSet_.sort(d3.ascending);
            var q1_ = d3.quantile(data_sorted_, .25);
            var median_ = d3.quantile(data_sorted_, .5);
            var q3_ = d3.quantile(data_sorted_, .75);
            var end_ = d3.quantile(data_sorted_, .99)
            var interQuantileRange_ = q3_ - q1_
            var in_min_ = q1 - 1.5 * interQuantileRange;
            var in_max_ = q3 + 1.5 * interQuantileRange;
    
            var max = -1
            var min = 300
    
            for (var i = 0; i<dataSet.length; i++){
                if(dataSet[i] > max && dataSet[i] < in_max)
                    max = dataSet[i];
                if (dataSet[i] < min && dataSet[i] > in_min)
                    min = dataSet[i];
            }
    
            var max_ = -1
            var min_ = 300
    
            for (var i = 0; i<dataSet_.length; i++){
                if(dataSet_[i] > max_ && dataSet_[i] < in_max_)
                    max_ = dataSet_[i];
                if (dataSet_[i] < min_ && dataSet_[i] > in_min_)
                    min_ = dataSet_[i];
            }

            console.log(q1);
    
            var y = d3.scaleLinear()
                .domain([min_-10, end+10])
                .range([boxheight, 0]);
                
            svg.call(d3.axisLeft(y))
    
            var x = d3.scaleBand()
                .range([0, boxwidth])
                .domain(["Winner Height", "Loser Height"])
                .paddingInner(1)
                .paddingOuter(.7)
    
            svg.append("g")
                .attr("transform", "translate(0," + boxheight + ")")
                .call(d3.axisBottom(x))
    
            // a few features for the box
            var center = 100
            var width = 70
            
            // Show the main vertical line
            svg
                .append("line")
                .attr("x1", center)
                .attr("x2", center)
                .attr("y1", y(min) )
                .attr("y2", y(max) )
                .attr("stroke-width", 2)
                .attr("stroke", "black")
            
            // Show the box
            svg
                .append("rect")
                .attr("x", center - width/2)
                .attr("y", y(q3) )
                .attr("height", (y(q1)-y(q3)) )
                .attr("width", width )
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .style("fill", returnValue[0].value[0].color)
    
            var center_ = 240
            var width_ = 70
    
            svg
            .append("line")
            .attr("x1", center_)
            .attr("x2", center_)
            .attr("y1", y(min_) )
            .attr("y2", y(max_) )
            .attr("stroke-width", 2)
            .attr("stroke", "black")
        
        // Show the box
        svg
            .append("rect")
            .attr("x", center_ - width_/2)
            .attr("y", y(q3_) )
            .attr("height", (y(q1_)-y(q3_)) )
            .attr("width", width_ )
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .style("fill", returnValue[0].value[0].color)
            
            // show median, min and max horizontal lines
            svg
                .selectAll("horizontal_lines")
                .data([min, median, max])
                .enter()
                .append("line")
                .attr("x1", center-width/2)
                .attr("x2", center+width/2)
                .attr("y1", function(d){ return(y(d))} )
                .attr("y2", function(d){ return(y(d))} )
                .attr("stroke", "black")
                .attr("stroke-width", 2)
    
            svg
                .selectAll("horizontal_lines")
                .data([min_, median_, max_])
                .enter()
                .append("line")
                .attr("x1", center_-width_/2)
                .attr("x2", center_+width_/2)
                .attr("y1", function(d){ return(y(d))} )
                .attr("y2", function(d){ return(y(d))} )
                .attr("stroke", "black")
                .attr("stroke-width", 2)
        }

        else if(returnValue[0].key == "minutes"){
            var boxmargin = {top: 10, right: 30, bottom: 30, left: 400},
        boxwidth = 730 - boxmargin.left - boxmargin.right,
        boxheight = 400 - boxmargin.top - boxmargin.bottom;

        var svg = d3.select("svg")
            .append("svg")
            .attr("id", "boxplot")
            .attr("width", boxwidth + boxmargin.left + boxmargin.right)
            .attr("height", boxheight + boxmargin.top + boxmargin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + boxmargin.left + "," + boxmargin.top + ")");

        
        var dataSet = [];
        for(var i = 0; i<data.length; i++){
            if(data[i].tourney_level == returnValue[0].value[0].name)
                dataSet.push(data[i][returnValue[0].key]);
        }
        
        for (var i=0; i<dataSet.length; i++){
            if (dataSet[i] === 0){
                dataSet.splice(i,1);
                i--;
            }
        }

        var data_sorted = dataSet.sort(d3.ascending);
        var q1 = d3.quantile(data_sorted, .25);
        var median = d3.quantile(data_sorted, .5);
        var q3 = d3.quantile(data_sorted, .75);
        var end = d3.quantile(data_sorted, .99)
        var interQuantileRange = q3 - q1
        var in_min = q1 - 1.5 * interQuantileRange;
        var in_max = q3 + 1.5 * interQuantileRange;

        var max = -1
        var min = 300

        for (var i = 0; i<dataSet.length; i++){
            if(dataSet[i] > max && dataSet[i] < in_max)
                max = dataSet[i];
            if (dataSet[i] < min && dataSet[i] > in_min)
                min = dataSet[i];
        }

        var y = d3.scaleLinear()
            .domain([min-10, end+20])
            .range([boxheight, 0]);
            
        svg.call(d3.axisLeft(y))

        var x = d3.scaleBand()
            .range([0, boxwidth])
            .domain([returnValue[0].key])
            .paddingInner(1)
            .paddingOuter(.5)

        svg.append("g")
            .attr("transform", "translate(0," + boxheight + ")")
            .call(d3.axisBottom(x))

        // a few features for the box
        var center = 150
        var width = 100
        
        // Show the main vertical line
        svg
            .append("line")
            .attr("x1", center)
            .attr("x2", center)
            .attr("y1", y(min) )
            .attr("y2", y(max) )
            .attr("stroke-width", 2)
            .attr("stroke", "black")
        
        // Show the box
        svg
            .append("rect")
            .attr("x", center - width/2)
            .attr("y", y(q3) )
            .attr("height", (y(q1)-y(q3)) )
            .attr("width", width )
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .style("fill", returnValue[0].value[0].color)
        
        // show median, min and max horizontal lines
        svg
            .selectAll("horizontal_lines")
            .data([min, median, max])
            .enter()
            .append("line")
            .attr("x1", center-width/2)
            .attr("x2", center+width/2)
            .attr("y1", function(d){ return(y(d))} )
            .attr("y2", function(d){ return(y(d))} )
            .attr("stroke", "black")
            .attr("stroke-width", 2)
        } 
    }
}