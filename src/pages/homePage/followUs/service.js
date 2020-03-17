import request from '@/utils/request';
import qs from 'qs'

export async function query (params) {
    return request('/_os/index.php?com=common&t=getList&module=index-follow-us', {
      method: 'post',
      data: qs.stringify(params),
    });
}

export async function update (params) {
  return request('/_os/index.php?com=common&t=save&module=index-follow-us', {
    method: 'post',
    data: qs.stringify(params),
  });
}

export async function remove (params) {
  return request('/_os/index.php?com=common&t=delete&module=index-follow-us', {
    method: 'post',
    data: qs.stringify(params),
  });
}

export async function updateSort(params) {
  return request('/_os/index.php?com=common&t=setSortOrder&module=index-follow-us', {
    method: 'post',
    data: qs.stringify(params),
  });
}



