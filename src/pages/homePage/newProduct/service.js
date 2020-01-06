import request from '@/utils/request';
import qs from 'qs'

export async function query (params) {
    return request('/_os/index.php?com=common&t=getList&module=index-new-arrival', {
      method: 'get',
      data: qs.stringify(params),
    });
}

export async function update (params) {
  return request('/_os/index.php?com=common&t=save&module=index-new-arrival', {
    method: 'post',
    data: qs.stringify(params),
  });
}

export async function remove (params) {
  return request('/_os/index.php?com=common&t=delete&module=index-new-arrival', {
    method: 'post',
    data: qs.stringify(params),
  });
}

export async function updateSort(params) {
  return request('/_os/index.php?com=common&t=setSortOrder&module=index-new-arrival', {
    method: 'post',
    data: qs.stringify(params),
  });
}

export async function uploadImg (params) {
  return request('/_os/index.php?com=common&t=imageUpload&module=index-spot-image', {
    method: 'post',
    data: qs.stringify(params),
  });
}


