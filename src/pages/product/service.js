import request from '@/utils/request';
import qs from 'qs'

export async function query (params) {
    return request('/_shop/index.php?com=product&t=formValues', {
      method: 'post',
      data: qs.stringify(params),
    });
}

export async function getConfig(params) {
    return request('/_shop/index.php?com=product&t=tableConfig', {
      method: 'get',
      data: qs.stringify(params),
    });
}

export async function save (params) {
    return request('/_shop/index.php?com=product&t=saveProduct', {
      method: 'post',
      data: qs.stringify(params),
    });
}

export async function categoryTree (params) {
  return request('/_shop/index.php?com=category&t=getCategoryTree', {
    method: 'get',
    data: qs.stringify(params),
  });
}





