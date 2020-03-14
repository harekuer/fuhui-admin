import request from '@/utils/request';
import qs from 'qs'

export async function query (params) {
    return request('/_os/index.php?com=common&t=getList', {
      method: 'post',
      data: qs.stringify(params),
    });
}

export async function update (params) {
  return request('/_os/index.php?com=common&t=save', {
    method: 'post',
    data: qs.stringify(params),
  });
}

export async function detail (params) {
  return request('/_os/index.php?com=common&t=getOne', {
    method: 'post',
    data: qs.stringify(params),
  });
}

export async function remove (params) {
  return request('/_os/index.php?com=common&t=delete', {
    method: 'post',
    data: qs.stringify(params),
  });
}

export async function updateSort(params) {
  return request('/_os/index.php?com=common&t=setSortOrder', {
    method: 'post',
    data: qs.stringify(params),
  });
}



