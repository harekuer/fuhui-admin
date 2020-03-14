import request from '@/utils/request';
import qs from 'qs'

export async function query (params) {
    return request('/_os/index.php?com=category&t=getCategoryTree', {
      method: 'post',
      data: qs.stringify(params),
    });
}

export async function update (params) {
  return request('/_os/index.php?com=category&t=saveCategory', {
    method: 'post',
    data: qs.stringify(params),
  });
}

export async function remove (params) {
  return request('/_os/index.php?com=category&t=removeCategory', {
    method: 'post',
    data: qs.stringify(params),
  });
}

export async function updateCategory (params) {
  return request('/_os/index.php?com=category&t=updateCategoryList', {
    method: 'post',
    data: qs.stringify(params),
  });
}

export async function categoryTree (params) {
  return request('/_os/index.php?com=category&t=getCategoryTree', {
    method: 'get',
    data: qs.stringify(params),
  });
}

export async function detail (params) {
  return request('/_os/index.php?com=category&t=getCategoryInfo', {
    method: 'post',
    data: qs.stringify(params),
  });
}



