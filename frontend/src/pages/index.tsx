import styles from './index.less';
import client from '@/utils/client';
// import 'ol/ol.css';
import { Map, View } from 'ol';

// function addPathToMap(data:JSON) {

// }

// function addToMap(data:JSON) {

// }

// function getPath(start:number, end:number) {
//   client.post('/api/getpath', {
//     start: start,
//     end: end
//   })
//   .then(function(response) {
//     addPathToMap(response.data);
//   })
//   .catch(function(error) {
//     console.log(error);
//   })
// }

// function getAllPoint() {
//   client.get('/api/getallpoint')
//   .then(function(response) {
//     addToMap(response.data);
//   })
//   .catch(function(error) {
//     console.log(error);
//   })
// }

export default function IndexPage() {
  return (
    Map
  );
}
