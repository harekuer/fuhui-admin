import request from '@/utils/request';
import qs from 'qs'

export async function query (params) {
    return request('/_os/index.php?com=common&t=getList&module=index-nav-top', {
      method: 'get',
      data: qs.stringify(params),
    });
}

export async function update (params) {
  return request('/_os/index.php?com=common&t=save&module=index-nav-top', {
    method: 'post',
    data: qs.stringify(params),
  });
}

export async function remove (params) {
  return request('/_os/index.php?com=common&t=removeCategory', {
    method: 'post',
    data: qs.stringify(params),
  });
}

export async function updateCategory (params) {
  return request('/_os/index.php?com=common&t=updateCategoryList', {
    method: 'post',
    data: qs.stringify(params),
  });
}

export async function categoryTree (params) {
  return request('/_os/index.php?com=common&t=getCategoryTree', {
    method: 'get',
    data: qs.stringify(params),
  });
}


