import request from '@/utils/request';
import qs from 'qs'

export async function fakeAccountLogin(params) {
  return request('/_os/index.php?com=login&t=loginAdmin', {
    method: 'POST',
    data: qs.stringify(params),
  });
}
export async function getFakeCaptcha(mobile) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}
