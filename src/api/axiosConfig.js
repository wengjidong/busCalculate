import axios from 'axios';

//axios全局配置
const Axios = axios.create({
  //请求接口
  baseURL:"http://192.168.1.224:8090/",
  //超时设置
  timeout:80000,
  //请求头设置
})

// 超时设置
// axios.defaults.timeout = 2500;

// 添加请求拦截器
Axios.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});
// 添加响应拦截器
Axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  let data = response.data;
  if (!data.hasOwnProperty('code')) {
    return data;
  }
  if (data.code === 0 || data.code === -1) {
    return data;
  }

  const error = new Error(data.msg || '');
  // 对请求错误做统一提示
  console.log(error.message);
  error.data = data;
  error.response = response;

  throw error;
}, function (error) {
  // 对响应错误做点什么
  if (error && error.response) {
    error.message = status(error);
  }
  return Promise.reject(error);
});

export default Axios
