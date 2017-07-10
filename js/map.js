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

var map = L.map('map').setView([34.5, -106.1], 7)
L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2t5bGFyaXR5IiwiYSI6ImNpczI4ZHBmbzAwMzgyeWxrZmZnMGI5ZXYifQ.1-jGFvM11OgVgYkz3WvoNw")
	.addTo(map)

var mousePos = {
	x: -100,
	y: -100
}

var hexLayerClass = function() {
	this.onDrawLayer = function(info) {
		var ctx = info.canvas.getContext('2d')

		ctx.clearRect(0, 0, info.canvas.width, info.canvas.height)

		ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'

		data.features.forEach(function(d, i) {
			var polygons = []
			d.geometry.coordinates.forEach(function(coords) {
				coordSet = []
				coords.forEach(function(coordPair) {
					var newPair = info.layer._map.latLngToContainerPoint([coordPair[1], coordPair[0]])
					coordSet.push([newPair.x, newPair.y])
				})
				polygons.push(coordSet)
			})

			ctx.beginPath()

			polygons.forEach(function(coords) {
				// console.log(coords)
				var containsHex = false
				d.geometry.coordinates[0].forEach(function(coord) {
					containsHex = info.bounds.contains([coord[1], coord[0]]) ? true : containsHex;
				})

				if (containsHex) {
					ctx.moveTo(coords[0][0], coords[0][1])
					coords.forEach(function(coord) {
						// console.log(coord)
						ctx.lineTo(coord[0], coord[1])
					})
				}
			})

			var hoveringCurrent = mousePos ? ctx.isPointInPath(mousePos.x, mousePos.y) : false
			ctx.fillStyle = mousePos && hoveringCurrent ? 'rgba(255, 255, 255, 0.5)' : colorScale(d.properties.size)

			if (hoveringCurrent) {
				// TODO: Tooltip
			}

			ctx.fill()

			if (d.properties.flooded) {
				ctx.stroke()
			}

			ctx.closePath()
		})
	}
}

hexLayerClass.prototype = new L.CanvasLayer()
var hexLayer = new hexLayerClass()
hexLayer.addTo(map)

var mouseIsDown = false
document.getElementById('map').addEventListener('mousedown', function(e) {
	mouseIsDown = true
})
document.getElementById('map').addEventListener('mousemove', function(e) {
	mousePos = {
		x: e.clientX,
		y: e.clientY
	}
	if (!mouseIsDown) {
		hexLayer.needRedraw()
	}
})
document.getElementById('map').addEventListener('mouseup', function(e) {
	mouseIsDown = false
})
