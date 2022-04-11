import * as React from 'react';
import { Button, FormGroup, FormControlLabel, Switch } from '@mui/material';
import { Map, GoogleApiWrapper } from 'google-maps-react';

class ForceTouchMap extends React.Component {
    
    constructor(props) {
        super(props);
        this.elementRef = React.createRef();
        this.state = {
            maxZoom: 14,
            minZoom: 14,
            prevZoom: 14,
            zoom: 14,
            center: {
                lat: 45.94587410541393,
                lng: -66.64352527299252
            },
            map: null,
            mapGesture: "none",
            mouseDownX: null,
            mouseDownY: null,
            mouseMoveX: null,
            mouseMoveY: null,
        }
    }

    componentDidMount() {
        this.nv.addEventListener("webkitmouseforcechanged", this.forceChanged);
        this.nv2.addEventListener("webkitmouseforcechanged", this.forceChanged);
        this.mapDivRef.addEventListener("webkitmouseforcechanged", this.forceChanged);
        this.getcurrentLocation();
    }

    componentWillUnmount() {
        this.nv.removeEventListener("webkitmouseforcechanged", this.forceChanged);
        this.nv2.removeEventListener("webkitmouseforcechanged", this.forceChanged);
        this.mapDivRef.removeEventListener("webkitmouseforcechanged", this.forceChanged);
    }

    render() {
        return <div>
            <div id="mapDiv" ref={elem => this.mapDivRef = elem} onMouseUp={this.handleMouseEvent} onMouseDown={this.handleMouseEvent} onMouseMove={this.handleMouseEvent}>
                <Map
                    ref={elem => this.mapRef = elem}
                    google={this.props.google}
                    zoom={this.state.zoom}
                    panControl={false}
                    onMousemove={this.mouseMove}
                    initalCenter={this.state.center}
                    center={this.state.center}
                    mapTypeControl={false}
                    streetViewControl={false}
                    fullscreenControl={false}
                    onZoomChanged={this.zoomChanged}
                    onCenter_changed={this.centerChanged}
                    onReady={this.onReady}
                    gestureHandling={this.state.mapGesture}

                ></Map>
            </div>
            <div>
                <Button id="zoomIn" ref={elem => this.nv = elem} variant="contained">Zoom in</Button>
                <Button id="zoomOut" ref={elem => this.nv2 = elem} variant="contained">Zoom out</Button>
                <FormGroup>
                    <FormControlLabel control={<Switch checked={this.state.mapGesture === "auto" ? true : false} onChange={this.onChange} />} label="Gesture" />
                </FormGroup>
            </div>
        </div>

    }


    forceChanged = (event) => {
        // Perform operations in response to changes in force
        if ("webkitForce" in event) {
            // Retrieve the force level
            var forceLevel = event["webkitForce"];

            if (event.target.id === "zoomIn") {

                const newZoom = Math.round(rangeMap(forceMultipler * forceLevel, in_min, in_max, out_min, out_max));

                if (newZoom > this.state.zoom) {
                    console.log("zoom in", this.state.zoom, newZoom);
                    this.setState({
                        zoom: newZoom,
                        maxZoom: newZoom
                    })
                }


            } else if (event.target.id === "zoomOut") {

                const inverseForce = reverseForce(forceMultipler * forceLevel, in_min, in_max);
                const newZoom = Math.round(rangeMap(inverseForce, in_min, in_max, out_min, out_max));
                console.log(newZoom);


                if (newZoom < this.state.zoom) {
                    console.log("zoom out", this.state.zoom, newZoom);
                    // console.log(forceLevel, rangeMap(forceLevel));
                    this.setState({
                        zoom: newZoom,
                        minZoom: newZoom
                    })
                }
            } else if (event.currentTarget.id === "mapDiv") {
                var panByX = 0;
                var panByY = 0;

                if (this.state.mouseMoveX) {
                    if (this.state.mouseMoveX > panningDiagonalSensitivity) {
                        panByX = Math.round(rangeMap(forceMultipler * forceLevel, in_min, in_max, 0, this.mapRef.mapRef.current.offsetWidth / 8));

                    } else if (this.state.mouseMoveX < -panningDiagonalSensitivity) {
                        panByX = Math.round(rangeMap(forceMultipler * forceLevel, in_min, in_max, 0, -this.mapRef.mapRef.current.offsetWidth / 8));

                    }
                }

                if (this.state.mouseMoveY) {
                    if (this.state.mouseMoveY > panningDiagonalSensitivity) {
                        panByY = Math.round(rangeMap(forceMultipler * forceLevel, in_min, in_max, 0, this.mapRef.mapRef.current.offsetHeight / 8));

                    } else if (this.state.mouseMoveY < -panningDiagonalSensitivity) {
                        panByY = Math.round(rangeMap(forceMultipler * forceLevel, in_min, in_max, 0, -this.mapRef.mapRef.current.offsetHeight / 8));
                    }
                }

                this.mapRef.map.panBy(panByX, panByY);

            }

        }
    }

    mouseMove = (props, map, event) => {
        // console.log(event.latLng.lat(), event.latLng.lng());
        // console.log(event.google.maps);
        // console.log(map);
        // console.log(event.latLng.lat(), event.latLng.lng());
        // this.setState({
        //     center: {
        //         lat: event.latLng.lat(),
        //         lng: event.latLng.lng()
        //       }
        // })
    }

    zoomChanged = (props, map, event) => {
        console.log(map.zoom)
        this.setState({
            zoom: map.zoom
        })
    }

    centerChanged = (props, map, event) => {
        console.log(map.zoom)
    }


    onReady = (props, map, event) => {
        if (!this.state.map) {
            console.log(map)
            this.setState({
                map: map
            })
        }
    }

    handleMouseEvent = (event) => {

        if (event.type === "mousedown") {
            // console.log("Mouse down", event);
            this.setState({
                mouseDownX: event.pageX,
                mouseDownY: event.pageY
            })
        } else if (event.type === "mouseup") {
            // console.log("Mouse up");
            this.setState({
                mouseDownX: null,
                mouseDownY: null,
                mouseMoveX: null,
                mouseMoveY: null
            })
            // console.log("Mouse up1", "Start: ", this.state.mouseDownX, this.state.mouseDownY, "End: ", this.state.mouseMoveX, this.state.mouseMoveY);
            // console.log("Mouse up2", "Start: ", this.state.mouseDownX - this.state.mouseDownX, this.state.mouseDownY - this.state.mouseDownY, "End: ", this.state.mouseMoveX - this.state.mouseDownX, this.state.mouseMoveY - this.state.mouseDownY);

        } else if (event.type === "mousemove") {
            // console.log("Mouse Move")

            if (this.state.mouseDownX) {
                // this.setState({
                //     mouseMoveX: event.pageX,
                //     mouseMoveY: event.pageY
                // })

                this.setState({
                    mouseMoveX: event.pageX - this.state.mouseDownX,
                    mouseMoveY: event.pageY - this.state.mouseDownY,
                })

                // console.log("Mouse Move1", "Start: ", this.state.mouseDownX, this.state.mouseDownY, "End: ", this.state.mouseMoveX, this.state.mouseMoveY);
                // console.log("Mouse Move2", "Start: ", this.state.mouseDownX - this.state.mouseDownX, this.state.mouseDownY - this.state.mouseDownY, "End: ", this.state.mouseMoveX - this.state.mouseDownX, this.state.mouseMoveY - this.state.mouseDownY);
                console.log("Mouse Move2", "Start: ", this.state.mouseDownX - this.state.mouseDownX, this.state.mouseDownY - this.state.mouseDownY, "End: ", this.state.mouseMoveX, this.state.mouseMoveY);

            }
        }
    }

    onChange = (event) => {

        var mapGesture = "none";
        if (this.state.mapGesture === "auto") {
            mapGesture = "none"
        } else {
            mapGesture = "auto"
        }

        this.setState({
            mapGesture: mapGesture
        })

        console.log(this.state.mapGesture);
    }



    getcurrentLocation() {
        if (navigator && navigator.geolocation) {
            new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(pos => {
                    const coords = pos.coords;
                    this.setState({
                        center: {
                            lat: coords.latitude,
                            lng: coords.longitude
                        }
                    })

                });
            });
        }
    }


}

// const in_min = 0;
// const in_max = 3;
// const out_min = 2;
// const out_max = 22;

const forceMultipler = 5;
const panningDiagonalSensitivity = 50

const in_min = 0;
const in_max = forceMultipler * 3;
const out_min = 2;
const out_max = 22;


function rangeMap(num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function reverseForce(forceLevel, minForceLevel, maxForceLevel) {
    return maxForceLevel + minForceLevel - forceLevel;
}


export default GoogleApiWrapper({
    apiKey: (process.env.REACT_APP_GOOGLE_API_KEY)
})(ForceTouchMap)