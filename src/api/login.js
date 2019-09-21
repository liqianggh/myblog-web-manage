import request from '@/utils/request'

export function login(username, password) {
  var params = { 'user_name': username, 'password': password }
  return request({
    // url: '/user/login' + '?username=' + username,
    url: '/login',
    method: 'post',
    data: params
  })
}

export function getInfo(token) {
  return request({
    url: '/manage/system/user',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'get'
  })
}
