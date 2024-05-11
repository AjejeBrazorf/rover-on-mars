"use client";
import Map from "ol/Map";
import View from "ol/View";
import "ol/ol.css";
import {FC, useEffect, useRef, useState} from "react";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import {Graticule} from "ol/layer";
import {Stroke} from "ol/style";
import styles from "./MarsMap.module.scss";
import clsx from "clsx";
const WEB_MERCATOR_COORDINATE_SYSTEM_ID = "EPSG:4326";
const MARS_TEXTURE_TILE_SOURCE = "http://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/celestia_mars-shaded-16k_global/";

const getNumRows = (z: number) => {
    let nz = 4;
    for (let i = 2; i < z; i++) {
        nz = nz * 2;
    }
    return nz - 1;
}

interface  MarsMapProps {
    center?: [number, number];
}

const MarsMap: FC<MarsMapProps> = () => {
    const mapTargetElement = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<Map>();
    const [mapReady, setMapReady] = useState(false)
    const [center, setCenter] = useState<[number, number]>([0,0])
    const incrementCenter = () => setCenter([center[0] + 5, center[1] + 5])

    useEffect(() => {
        const InitializeMap = new Map({
            layers: [
                new TileLayer({
                    source: new XYZ({
                        tileUrlFunction: (coordinate) => {
                            return MARS_TEXTURE_TILE_SOURCE +
                                coordinate[0] + '/' +
                                coordinate[1] + '/' +
                                (getNumRows(coordinate[0]) - coordinate[2]) + '.png';
                        }
                    }),
                }),
                new Graticule({  showLabels: true, opacity: 1, strokeStyle: new Stroke({ color: 'rgba(239,122,39, 0.4)', miterLimit: 1 })}),
            ],
            view: new View({
                projection: WEB_MERCATOR_COORDINATE_SYSTEM_ID,
                minZoom: 5,
                zoom: 5,
                maxZoom: 5,
                center: center ?? [0,0]
            }),
            controls: [],
            interactions: []
        });

        InitializeMap.setTarget(mapTargetElement.current || "");
        setMap(InitializeMap);
        InitializeMap.once('rendercomplete', () => {
            setMapReady(true)
        })

        return () => InitializeMap.setTarget("");
    }, []);

    useEffect(() => {
        if (map) {
            map.getView().setCenter(center ?? [0,0]);
        }
    }, [center, map]);
    return (
        <>
            <button style={{position: "absolute", top: 10, right: 10, zIndex: 10}} onClick={incrementCenter}>move</button>
            <div
                className={clsx(styles.map, {[styles.animate]: mapReady} )}
                ref={mapTargetElement}
            ></div>
        </>
    );
};

export default MarsMap;
