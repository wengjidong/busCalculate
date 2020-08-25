import Axios from '@/api/axiosConfig'
export function listBusStandAway(params) {
  return Axios({
    url: '/listBusStandAway',
    method: 'get',
    params
  })
}
export function listBusStation(params) {
  return Axios({
    url: '/listBusStation',
    method: 'get',
    params
  })
}
export function addStation(params) {
  return Axios({
    url: '/addStation',
    method: 'post',
    params
  })
}
export function listStationForAdd(params) {
  return Axios({
    url: '/listStationForAdd',
    method: 'get',
    params
  })
}
export function listBus(params) {
  return Axios({
    url: '/listBus',
    method: 'get',
    params
  })
}
