import request from '@/utils/request';
import qs from 'qs'



// 菜单列表
export async function query (params,url) {
  return request(url, {
    method: 'get',
    data: qs.stringify(params),
  });
}