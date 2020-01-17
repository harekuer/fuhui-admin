import request from '@/utils/request';
import qs from 'qs'



// 菜单列表
export async function query (params,url) {
  return request(url, {
    method: 'get',
    data: qs.stringify(params),
  });
}

// 列表数据
export async function getList (params,url) {
  return request(url, {
    method: 'post',
    data: qs.stringify(params),
  });
}

// 列表数据
export async function getConfig (params,url) {
  return request(url, {
    method: 'get',
    data: qs.stringify(params),
  });
}