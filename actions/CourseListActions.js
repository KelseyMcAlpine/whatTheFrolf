import axios from 'axios';
import {
  DG_API_KEY,
  DG_COURSE_DETAILS_SIG,
  DG_RADIUS_LIST_SIG,
  DG_COURSE_IMAGE_SIG,
  GOOGLEMAPS_KEY
} from 'react-native-dotenv';
import { Actions } from 'react-native-router-flux';
import {
  COURSE_LIST_FETCH_SUCCESS,
  COURSE_DETAILS_FETCH_SUCCESS
} from './types';

export const courseListFetch = (userLat, userLon) => async (dispatch) => {
  try {
    let { data } = await axios.get('https://www.dgcoursereview.com/api_test/index.php', {
        params: {
          key: DG_API_KEY,
          mode: 'near_rad',
          lat: userLat,
          lon: userLon,
          rad: 25,
          sig: DG_RADIUS_LIST_SIG
        }
      }
    );
    let allInfo = await Promise.all(
      data.map(async (course) => {
        let dgc_image = await axios.get('https://www.dgcoursereview.com/api_test/index.php', {
          params: {
            key: DG_API_KEY,
            mode: 'crsephto',
            id: course.course_id,
            sig: DG_COURSE_IMAGE_SIG
          }
        });

        // let dgc_image = await axios.get('https://api.myjson.com/bins/a546b');

        const courseLatLon = `${course.latitude},${course.longitude}`;
        const userLatLon = `${userLat},${userLon}`;

        let google_distance = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
          params: {
            units: 'imperial',
            origins: userLatLon,
            destinations: courseLatLon,
            key: GOOGLEMAPS_KEY
          }
        })

        return {
          id: course.course_id,
          key: course.course_id,
          name: course.name,
          latitude: course.latitude,
          longitude: course.longitude,
          rating: course.rating,
          imageURL: dgc_image.data.course_photo_url_medium,
          distance: google_distance.data.rows[0].elements[0].distance.text
        }
      })
    )
    console.log('all info: ', allInfo);
    dispatch({ type: COURSE_LIST_FETCH_SUCCESS, payload: allInfo });
  } catch(e) {
    console.error(e);
  }
};

export const courseDetailsFetch = (courseId, distance, callback) => async (dispatch) => {
  try {
    let { data } = await axios.get('https://www.dgcoursereview.com/api_test/index.php', {
      params: {
        key: DG_API_KEY,
        mode: 'crseinfo',
        id: courseId,
        sig: DG_COURSE_DETAILS_SIG
      }
    });
    dispatch({ type: COURSE_DETAILS_FETCH_SUCCESS, payload: {
        courseDetails: data,
        distance
      }
    });
    callback();
  } catch(e) {
    console.error(e);
  }
};
