var minHexSize = 1,
	maxHexSize = 6

var colorScale = d3.scaleQuantile()
	.domain([minHexSize, maxHexSize])
	.range(['rgba(0,162,200, 0.5)', 'rgba(0,71,182, 0.5)', 'rgba(163,6,201, 0.5)', 'rgba(219,10,108, 0.5)', 'rgba(221,6,18, 0.5)'])
var sizingScale = d3.scaleLinear()
	.domain([minHexSize, maxHexSize])
	.range([0.1, 1])

// BEGIN DATA CREATION
var data = turf.hexGrid([-109, 37, -103, 32], 6, 'miles')

data.features.map(function(feature) {
	feature.properties = {
		size: (Math.random() * (maxHexSize - minHexSize)) + minHexSize,
		flooded: Math.random() > .9 ? true : false
	}

	feature.geometry = turf.transformScale(feature.geometry, sizingScale(feature.properties.size))

	return feature
})
// END DATA CREATION

var map = L.map('map')
L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2t5bGFyaXR5IiwiYSI6ImNpczI4ZHBmbzAwMzgyeWxrZmZnMGI5ZXYifQ.1-jGFvM11OgVgYkz3WvoNw")
	.addTo(map)

var mousePos = {
	x: -100,
	y: -100
}

var toolTipPos = {
	id: 0,
	x: 0,
	y: 0,
	feature: {}
}

map.on('load', function() {
	data.features.forEach(function(d, i) {
		var coords = d.geometry.coordinates.map(function(polygon) {
			var newPolygon = []
			polygon.map(function(coord) {
				newPolygon.push([coord[1], coord[0]])
			})
			return newPolygon
		})
		var hex = L.polygon(coords, {fillColor: colorScale(d.properties.size), fillOpacity: 1, stroke: d.properties.flooded, weight: 1, color: 'rgba(255, 255, 255, 0.5)'}).addTo(map)
		hex.bindPopup(function() {
			var centroid = turf.centroid(d);
			centroid = [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]]

			var popup = L.popup()
				.setLatLng(centroid)
				.openOn(map)

			var width = 300,
				height = 500

			var popup = d3.selectAll('.leaflet-popup')
				.html('')
				.style('width', width + 'px')
				.style('height', height + 'px')
				.style('bottom', -(height / 2) + 'px')
				.style('left', '100px')
				.style('margin', 0)
				.style('pointer-events', 'none')

			var tail = popup.append('svg')
				.style('position', 'absolute')
				.style('left', '-100px')
				.style('height', height)
				.append('polygon')
				.attr('points', function() {
					return [[100, 0], [100, height], [0, height / 2]]
				})
				.style('fill', 'rgba(255, 255, 255, 0.5)')

			var content = popup.append('div')
				.attr('id', 'popupContent')
				.style('width', width + 'px')
				.style('height', height + 'px')

			content.append('div')
				.html('Size: ' + Math.round(d.properties.size))

			content.append('div')
				.html('Flooded: ' + (d.properties.flooded ? 'Yes' : 'No'))

			content.append('button')
				.style('pointer-events', 'auto')
				.text('close')
				.on('click', function() {
					map.closePopup()
				})

			return popup
		})
	})
})

map.setView([34.5, -106.1], 7)

// var hexLayerClass = function() {
// 	this.onDrawLayer = function(info) {
// 		var ctx = info.canvas.getContext('2d')

// 		ctx.clearRect(0, 0, info.canvas.width, info.canvas.height)

// 		ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'

// 		data.features.forEach(function(d, i) {
// 			var polygons = []
// 			d.geometry.coordinates.forEach(function(coords) {
// 				coordSet = []
// 				coords.forEach(function(coordPair) {
// 					var newPair = info.layer._map.latLngToContainerPoint([coordPair[1], coordPair[0]])
// 					coordSet.push([newPair.x, newPair.y])
// 				})
// 				polygons.push(coordSet)
// 			})

// 			ctx.beginPath()

// 			polygons.forEach(function(coords) {
// 				// console.log(coords)
// 				var containsHex = false
// 				d.geometry.coordinates[0].forEach(function(coord) {
// 					containsHex = info.bounds.contains([coord[1], coord[0]]) ? true : containsHex;
// 				})

// 				if (containsHex) {
// 					ctx.moveTo(coords[0][0], coords[0][1])
// 					coords.forEach(function(coord) {
// 						// console.log(coord)
// 						ctx.lineTo(coord[0], coord[1])
// 					})
// 				}
// 			})

// 			var hoveringCurrent = mousePos ? ctx.isPointInPath(mousePos.x, mousePos.y) : false
// 			ctx.fillStyle = mousePos && hoveringCurrent ? 'rgba(255, 255, 255, 0.5)' : colorScale(d.properties.size)

// 			if (hoveringCurrent) {
// 				toolTipPos.feature = d
// 			}

// 			ctx.fill()

// 			if (d.properties.flooded) {
// 				ctx.stroke()
// 			}

// 			ctx.closePath()
// 		})
// 	}
// }

// function createToolTip() {
// 	removeToolTip()

// 	console.log('tooltip')

// 	var toolTip = document.createElement('div')
// 	toolTipPos.x = mousePos.x
// 	toolTipPos.y = mousePos.y

// 	toolTip.id = 'toolTip'
// 	toolTip.style.left = toolTipPos.x + 'px'
// 	toolTip.style.top = toolTipPos.y + 'px'
// 	toolTip.style.opacity = 1;

// 	var xhr= new XMLHttpRequest();
// 	xhr.open('GET', 'templates/tooltip.html', true);
// 	xhr.onreadystatechange = function() {
// 		if (this.readyState !== 4) return;
// 		if (this.status !== 200) return;
// 		toolTip.innerHTML = this.responseText + '<div>ID: ' + toolTipPos.id + '</div>';
// 	};
// 	xhr.send();

// 	document.getElementById('map').appendChild(toolTip)
// }

// function removeToolTip() {
// 	var toolTip = document.getElementById('toolTip')
// 	if (toolTip) {
// 		toolTip.parentNode.removeChild(toolTip)
// 	}
// }

// // hexLayerClass.prototype = new L.CanvasLayer()
// // var hexLayer = new hexLayerClass()
// // hexLayer.addTo(map)

// var mouseIsDown = false
// var dragging = false;
// document.getElementById('map').addEventListener('mousedown', function(e) {
// 	mouseIsDown = true
// })
// document.getElementById('map').addEventListener('mousemove', function(e) {
// 	mousePos = {
// 		x: e.clientX,
// 		y: e.clientY
// 	}
// 	if (!mouseIsDown) {
// 		// hexLayer.needRedraw() // TODO: UNCOMMENT
// 	} else {
// 		dragging = true
// 	}
// })
// document.getElementById('map').addEventListener('mouseup', function(e) {
// 	if (!dragging) {
// 		// createToolTip()
// 		var centroid = turf.centroid(toolTipPos.feature);
// 		centroid = [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]]
// 		L.popup()
// 			.setLatLng(centroid)
// 			.setContent('<p>testing wow</p>')
// 			.openOn(map)
// 	}

// 	mouseIsDown = false
// 	dragging = false
// })
