import { View } from 'react-native';

const MapView = (props) => View(props);
const Marker = (props) => View(props);
const Polyline = (props) => View(props);
const Circle = (props) => View(props);
const Polygon = (props) => View(props);
const Callout = (props) => View(props);

MapView.Marker = Marker;
MapView.Polyline = Polyline;
MapView.Circle = Circle;
MapView.Polygon = Polygon;
MapView.Callout = Callout;

export default MapView;
export { Marker, Polyline, Circle, Polygon, Callout };

export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';
