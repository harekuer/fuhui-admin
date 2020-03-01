import {
    Button,
    Card,
    Form,
    Icon,
    Input,
    InputNumber,
    Switch,
    Select,
    TreeSelect,
    Checkbox,
    Tooltip,
    Table,
  } from 'antd';
  import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
  import React, { PureComponent } from 'react';
  import UEditor from '@/components/Ueditor'
  import SortableList from '@/components/SortableList'
  import 'rc-color-picker/assets/index.css'
  import MultiUpload from '@/components/MultiUpload'
  import ColorPicker from 'rc-color-picker';
  import { connect } from 'dva';
  import styles from './style.less';
  import { array } from 'prop-types';
  
  const FormItem = Form.Item;
  const { Option } = Select;
  const { Search } = Input;
  
  // 新sku与之前已编辑的sku对比，保留之前编辑的数据
  function combineData (prevSku, sku) {
    let newData = []
    sku.map((item) => {
      let obj = item
      prevSku.forEach((option) => {
        if(option.sizeId === item.sizeId&& option.colorId === item.colorId){
          obj = option
        } 
      })
      newData.push(obj)
    })
    return newData
  }

  class BasicForm extends PureComponent {
    state = {
      ladderValidate: {
        isEmpty: true,
        isRangeError: false,
        isPriceError: false,
      }
    };

    handleSubmit = e => {
      const { dispatch, form, productDetail } = this.props;
      const { data } = productDetail
      e.preventDefault();
      form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          let obj ={
            ...values,
            productKeywords: data.productKeywords,
            sku: data.sku,
          }
          dispatch({
            type: 'productDetail/save',
            payload: values,
          });
        }
      });
    };

    componentDidMount() {
        const { dispatch,location } = this.props;
        const { state } = location;
        //获取配置表
        dispatch({
          type: 'productDetail/getConfig',
        });
        //获取平台分类
        dispatch({
          type: 'productDetail/getCategoryTree',
        });
        //获取店铺分类
        dispatch({
          type: 'productDetail/getShopTree',
        });
        if(state && state.products_id) {
          dispatch({
            type: 'productDetail/query',
            payload: {
              products_id: state.products_id,
            }
          });
        }

    }

    //新增阶梯价
    onAddLadder = () => {
      const { dispatch, productDetail } = this.props;
      const { data } = productDetail
      let newData = data
      let obj = {
        min_order:'',
        price:''
      }
      const { ladderValidate } = this.state
      newData.ladderPrice.push(obj)
      dispatch({
        type: 'productDetail/updateState',
        payload: {
          data: newData,
        }
      });
      this.setState({
        ladderValidate: {
          isEmpty: true,
          isRangeError: ladderValidate.isRangeError,
          isPriceError: ladderValidate.isPriceError,
        }
      })
    }

    //验证是否有未填的输入框，以及是否为空
    validateLadder = () => {
      const { dispatch, productDetail } = this.props;
      const { data } = productDetail
      let newData = data
      let obj = {
        isEmpty: false,
        isRangeError: false,
        isPriceError: false,
      }
      newData.ladderPrice.forEach((item,index) => {
        if(Number(item.min_order) === 0 || Number(item.price) === 0){
          obj.isEmpty = true
        }
        if(index > 0){
          if(newData.ladderPrice[index-1].min_order >= item.min_order ){
            obj.isRangeError = true
          }
          if(item.price >= newData.ladderPrice[index-1].price) {
            obj.isPriceError = true
          }
        }
      })
      this.setState({
        ladderValidate: {
          ...obj,
        },
      })
    }
  
    render() {
      const { submitting,productDetail, dispatch } = this.props;
      const { data, config,initColor,priceUnit,categoryList, shopCateList } = productDetail
      const { 
        form: { getFieldDecorator, getFieldValue, setFieldsValue },
      } = this.props;
      const { ladderValidate } = this.state
      const formItemLayout = {
        labelCol: {
          xs: {
            span: 24,
          },
          sm: {
            span: 4,
          },
        },
        wrapperCol: {
          xs: {
            span: 24,
          },
          sm: {
            span: 12,
          },
          md: {
            span: 19,
          },
        },
      };
      const submitFormLayout = {
        wrapperCol: {
          xs: {
            span: 24,
            offset: 0,
          },
          sm: {
            span: 10,
            offset: 7,
          },
        },
      };

      //递归拷贝类目数据
      const categoryTreeList = (nodeList) => {
        let list = [];
        nodeList.forEach(item => {
          let obj = {};
          obj.key = item.categories_id;
          obj.value = item.categories_id;
          obj.title = item.categories_name;
          if(item.children) {
            obj.children = categoryTreeList(item.children)
          }
          list.push(obj)
        })
        return list
      }

      const treeData = categoryTreeList(categoryList);
      const shopTreeData = categoryTreeList(shopCateList);

      //图片排序组件船只
      const sortProps = {
        data: data.productImage,
        onSaveState (items) {
          let newData = data
          newData.productImage = items
          dispatch({
            type: 'productDetail/updateState',
            payload: {
              data: newData,
            }
          });
        },
      }
    
      //产品多图上传组件传值
      const multiProps = {
        id: 'flashContainer',
        products_id: '',
        onUploadItem: (addItem) => {
          let newData = data
          let newItem = addItem.map(item => {
            const path = item.img_original.split('upload')
            const imgPath = path[path.length -1]
            item.image_path = `upload${imgPath}`
            item.image_sort = 100
            item.image_url = item.img_original
            return item
          })
          newData.productImage = newData.productImage.concat(newItem)
          dispatch({
            type: 'productDetail/updateState',
            payload: {
              data: newData,
            }
          });
        },
      }

      //打包多图上传组件传值
      const multiPackProps = {
        id: 'packageContainer',
        products_id: '',
        onUploadItem: (addItem) => {
          let newData = data
          let newItem = addItem.map(item => {
            const path = item.img_original.split('upload')
            const imgPath = path[path.length -1]
            item.image_path = `upload${imgPath}`
            item.image_url = item.img_original
            return item
          })
          newData.packagingImage = newData.packagingImage.concat(newItem)
          dispatch({
            type: 'productDetail/updateState',
            payload: {
              data: newData,
            }
          });
        },
      }


      const changeProperty = (key,index,value) => {
        let newData = data
        if(key === 'delete'){
          newData.customMoreProperty = newData.customMoreProperty.filter((item,_index) => _index !== index)
        } else if (key === 'add'){
          newData.customMoreProperty.push({text: '',value: ''})
        }else {
          newData.customMoreProperty[index][key] = value
        }
        dispatch({
          type: 'productDetail/updateState',
          payload: {
            data: newData,
          }
        });
      }

      const formatLabel = (list) => {
        list.map(item => {
          item.label = item.text
          return item
        })
        return list
      }

      //编辑关键词
      /*
      @param  key   add/delete/update
      */
      const changeKeyword = (key,index,value) => {
        let newData = data
        if(key === 'delete'){
          newData.productKeywords = newData.productKeywords.filter((item,_index) => _index !== index)
        } else if (key === 'add'){
          newData.productKeywords.push('')
        }else {
          newData.productKeywords[index] = value
        }
        setFieldsValue({productKeywords: newData.productKeywords})
        dispatch({
          type: 'productDetail/updateState',
          payload: {
            data: newData,
          }
        });
      }

      //新增自定义尺码
      const onAddSize = (value) => {
        let newData = config
        let arr = []
        newData.productSize.props.dataSource.forEach(item => {
          arr.push(item.text)
        })
        if(!arr.includes(value)){
          const len = newData.productSize.props.dataSource.length
          newData.productSize.props.dataSource.push({value: Number(~len),text: value})
          dispatch({
            type: 'productDetail/updateState',
            payload: {
              config: newData,
            }
          });
        }
      }

      //新增自定义颜色
      const onAddColor = (value) => {
        let newData = config
        let arr = []
        newData.productColor.props.dataSource.forEach(item => {
          arr.push(item.text)
        })
        if(!arr.includes(value)){
          const len = newData.productColor.props.dataSource.length
          newData.productColor.props.dataSource.push({value: Number(~len),text: value,rgb: initColor})
          dispatch({
            type: 'productDetail/updateState',
            payload: {
              config: newData,
              initColor: '#F10',
            }
          });
        }
      }

      //新增自定义颜色，选择色值
      const changeColorHandler = (colors) => {
        dispatch({
          type: 'productDetail/updateState',
          payload: {
            initColor: colors.color,
          }
        });
      }

      //更改颜色和属性时更新sku表格
      const onChangeSku = (values,key) => {
        var colorArr = key === 'productSize' ?getFieldValue('productColor') : values
        var sizeArr = key === 'productSize' ? values : getFieldValue('productSize')
        let colorObjArr = []
        let sizeObjArr = []
        config.productColor.props.dataSource.map(item => { //获取color数组配置的text和value
          if(colorArr.includes(item.value)){
            colorObjArr.push(item)
          }
        })
        config.productSize.props.dataSource.map(item => {//获取size数组配置的text和value
          if(sizeArr.includes(item.value)){
            sizeObjArr.push(item)
          }
        })
        let newData = data
        let sku = []
        if(sizeObjArr.length && colorObjArr.length ){
          sizeObjArr.forEach(item => {
            colorObjArr.forEach(option => {
              let obj = {
                colorName: option.text,
                colorId: option.value,
                sizeName: item.text,
                sizeId: item.value,
                skuCode:'',
                status: '0'
              }
              sku.push(obj)
            })
          })
        }
        if(newData.sku.length && sku.length){
          newData.sku = combineData(newData.sku,sku)
        } else {
          newData.sku = sku
        }
        dispatch({
          type: 'productDetail/updateState',
          payload: {
            data: newData,
            choosedSize: sizeObjArr,
            choosedColor: colorObjArr,
          }
        });

      }

      //sku编辑
      const onEditSku = (value,key,index) => {
        let newData = data
        if(key === 'skuCode'){
          newData.sku[index][key] = value
        } else {
          newData.sku[index][key] = value? '1' : '0'
        }
        dispatch({
          type: 'productDetail/updateState',
          payload: {
            data: newData,
          }
        });
      }

      //阶梯价编辑或删除
      /* 
      @param  operate   delete/update
      @param  value    输入框值
      @param   key     字段key值
      */
      const onEditLadder = (operate, value,key,index) => {
        let newData = data
        if(operate === 'delete'){
          newData.ladderPrice = newData.ladderPrice.filter((item,_index) => _index !== index)
        } else {
          newData.ladderPrice[index][key] = value
        }
        dispatch({
          type: 'productDetail/updateState',
          payload: {
            data: newData,
          }
        });
      }

      //保存计量单位label
      const onEditUnit = (value,option) => {
        const priceUnit = option.props.children
        dispatch({
          type: 'productDetail/updateState',
          payload: {
            priceUnit,
          }
        });
      }     

      //sku列信息配置
      const columns = [
        {
          title: '尺码',
          dataIndex: 'sizeName',
          key: 'sizeName',
          render: (text, record,index) => {
            const obj = {
              children: text,
              props: {},
            };
            let sameRowCount = 1 // 默认rowSpan值为1，则无合并
            const listData = data.sku
            let totalIndex = data.sku.length // 得出总条数
            const fullIndex = index // 当前条数的之后的所有行index起始值
            const key = 'sizeName'
        
            if (index !== 0 && listData[fullIndex - 1][key] === listData[fullIndex][key]) {
              sameRowCount = 0
            } else {
              for (let i = fullIndex + 1; i < totalIndex; i++) { // 查询该行之后的行是否有合并行，合并条件为主产品id值相同
                if (listData[i][key] === listData[fullIndex][key]) {
                  sameRowCount++
                } else { // 无相同值则终止
                  break
                }
              }
            }
            obj.props.rowSpan = sameRowCount
            return obj
          }
        },
        {
          title: '颜色',
          dataIndex: 'colorName',
          key: 'colorName',
        },
        {
          title: '商品编码',
          dataIndex: 'skuCode',
          key: 'skuCode',
          render: (text,record,index) => {
            return <Input value={text} maxLength={20} style={{width: '200px'}} onChange={(e) => onEditSku(e.target.value,'skuCode',index)}/>
          }
        },
        {
          title: '操作',
          dataIndex: 'status',
          key: 'status',
          render: (text,record,index) => {
            return <Switch size="small" checked={text == '1'} onChange={checked => onEditSku(checked,'status',index)} />
          }
        },
      ];

      //阶梯价配置
      const ladderColumns = [
        {
          title: (<div>最小起订量<span style={{color: '#999'}} >({priceUnit == ''? '计量单位' : priceUnit })</span></div>),
          dataIndex: 'min_order',
          key: 'min_order',
          render: (text,record,index) => {
            return <div>
              ≥ <InputNumber value={text} min={1} max={99999} precision={0} 
                style={{width: '150px',borderColor: Number(text) === 0 ? '#f04134' : '#d9d9d9' }} 
                onChange={(value) => onEditLadder('update',value,'min_order',index)}
                onBlur={this.validateLadder}
              />
            </div>
          }
        },
        {
          title: (<div>FOB价格<span style={{color: '#999'}} >({priceUnit== ''? '计量单位' : priceUnit })</span></div>),
          dataIndex: 'price',
          key: 'price',
          render: (text,record,index) => {
            return <div>
              US $ <InputNumber value={text} min={0.01} max={9999999.99} precision={2} 
                style={{width: '150px',borderColor: Number(text) === 0 ? '#f04134' : '#d9d9d9' }} 
                onChange={(value) => onEditLadder('update',value,'price',index)}
                onBlur={this.validateLadder}
              />
            </div>
          }
        },
        {
          title: '',
          dataIndex: 'operate',
          key: 'operate',
          render: (text,record,index) => {
            if(data.ladderPrice.length > 1){
              return <Icon type="delete" className={styles.delete} onClick={() => onEditLadder('delete','','', index)} ></Icon>
            } else {
              return null
            }
          }
        },
      ];

      


      return (
        <Card bordered={false}>
            <Form
              onSubmit={this.handleSubmit}
              style={{
                marginTop: 8,
              }}
            >
              <Card size="small" title="基础信息" >
                <FormItem
                  {...formItemLayout}
                  label="产品类目"
                >
                  {getFieldDecorator('categoriesId', {
                    initialValue: data.categoriesId,
                    rules: [{required: true,message: '必填项不能为空'}],
                  })(
                    <TreeSelect
                      style={{width: '50%'}}
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      treeData={treeData}
                      placeholder="请选择产品分类"
                      treeDefaultExpandAll
                      allowClear
                    />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="产品分组"
                >
                  {getFieldDecorator('spCategoriesId', {
                    initialValue: data.spCategoriesId,
                    rules: [],
                  })(
                    <TreeSelect
                      style={{width: '50%'}}
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      treeData={shopTreeData}
                      placeholder="请选择产品分组"
                      treeDefaultExpandAll
                      allowClear
                    />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={
                      <span>
                        {config.productTitle ? config.productTitle.props.label: ''}
                        <em className={styles.optional}>
                          <Tooltip title={config.productTitle ? config.productTitle.props.info.help : ''}>
                            <Icon
                              type="info-circle-o"
                              style={{
                                marginRight: 4,
                              }}
                            />
                          </Tooltip>
                        </em>
                      </span>
                    }
                >
                  {getFieldDecorator('productTitle', {
                    initialValue: data.productTitle,
                    rules: [
                      {
                        required: true,
                        message: '请输入产品名称',
                      },
                    ],
                  })(
                    <Input
                      placeholder='请输入产品名称'
                      maxLength={config.productTitle ? config.productTitle.props.maxLength : 255}
                    />,
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={
                      <span>
                        {config.productKeywords ? config.productKeywords.props.label: ''}
                        <em className={styles.optional}>
                          <Tooltip title={config.productKeywords ? config.productKeywords.props.info.help : ''}>
                            <Icon
                              type="info-circle-o"
                              style={{
                                marginRight: 4,
                              }}
                            />
                          </Tooltip>
                        </em>
                      </span>
                    }
                >
                  {getFieldDecorator('productKeywords', {
                    initialValue: data.productKeywords,
                    rules: [
                      {
                        required: true,
                        message: '请至少填写一个关键词',
                      },
                    ],
                  })(
                    <ul style={{paddingLeft: '0'}}>
                      {
                        data.productKeywords && data.productKeywords.map((item,index) => {
                          return (
                            <li key={index}>
                              <Input
                                value={item}
                                style={{width: '95%'}}
                                placeholder={config.productKeywords && index === 0 ? config.productKeywords.props.placeholder : ''}
                                maxLength={config.productKeywords ? config.productKeywords.props.maxLength : 255}
                                onChange={e => changeKeyword('update',index, e.target.value)}
                              />
                              {data.productKeywords && data.productKeywords.length < 2 ? null : <Icon onClick={() => changeKeyword('delete',index)} type="delete" className={styles.delete} />}
                            </li>
                          )
                        })
                      }
                    </ul>
                    
                  )}
                  <div> {config.productKeywords ? config.productKeywords.props.info.bottom : ''} </div>
                  {data.productKeywords && data.productKeywords.length < 3 ? <Button onClick={() =>changeKeyword('add')}>  + 添加更多关键词 </Button> : null}
                </FormItem>
                <div>
                  <div className={styles.attrTitle}> 
                    <FormItem
                      {...formItemLayout}
                      label={config.productAttr? config.productAttr.props.label : ''}
                    >
                      {config.productAttr? config.productAttr.props.info.top : ''} 
                    </FormItem>
                  </div>
                  {
                    config.productAttr && config.productAttr.props.dataSource ? 
                    <div>
                      {
                        config.productAttr.props.dataSource.map((item,index) => {
                          return (
                            <FormItem
                              key={index}
                              {...formItemLayout}
                              label={item.label}
                            >
                              {
                                item.uiType === 'select' || item.uiType === 'combobox' || item.uiType === 'sequentialCombobox'? <div>
                                  {getFieldDecorator(item.name, {
                                    initialValue: data.productAttr? item.uiType === 'select'? formatLabel(data.productAttr[item.name][0]):formatLabel(data.productAttr[item.name]) : [],
                                    rules: [{required: item.required, message: item.required? '请补充该选项' : ''}],
                                  })(
                                    <Select mode={item.uiType === 'select' ? '' : 'multiple'} showArrow allowClear labelInValue style={{width: '50%'}}>
                                      {
                                        item.dataSource.map((option,_index) => {
                                        return <Option key={option.value}>{option.text}</Option>
                                        })
                                      }
                                    </Select>
                                  )}
                                </div> : null
                              }
                              {
                                item.uiType === 'input'? <div>
                                  {getFieldDecorator(item.name, {
                                    initialValue: data.productAttr? data.productAttr[item.name].value : '',
                                    rules: [],
                                  })(
                                    <Input style={{width: '50%'}}/>
                                  )}
                                </div> : null
                              }
                              {
                                item.uiType === 'checkbox'? <div>
                                  {getFieldDecorator(item.name, {
                                    initialValue: data.productAttr? data.productAttr[item.name].value : [],
                                    rules: [],
                                  })(
                                    <Checkbox.Group
                                      options={formatLabel(item.dataSource)}
                                    />
                                  )}
                                </div> : null
                              }
                              
                            </FormItem>
                          )
                        })
                      }
                    </div> : null
                  }
                </div>
              <FormItem
                {...formItemLayout}
                label={config.customMoreProperty? config.customMoreProperty.props.label : ''}
              >
                {getFieldDecorator('customMoreProperty', {
                  initialValue: data.customMoreProperty? data.customMoreProperty : [],
                  rules: [],
                })(
                  <ul>
                      {
                        data.customMoreProperty.map((item,index) => {
                          return (
                            <li key={index}>
                              <Input
                                value={item.text}
                                style={{width: '30%'}}
                                placeholder={config.customMoreProperty ? config.customMoreProperty.props.locale.textPlaceholder : ''}
                                maxLength={40}
                                onChange={e => changeProperty('text',index, e.target.value)}
                              />
                              <Input
                                value={item.value}
                                style={{width: '30%',marginLeft: '10px'}}
                                placeholder={config.customMoreProperty ? config.customMoreProperty.props.locale.valuePlaceholder : ''}
                                maxLength={40}
                                onChange={e => changeProperty('value',index, e.target.value)}
                              />
                               {data.customMoreProperty.length > 1 && data.customMoreProperty.length < 10 ? <Icon onClick={() => changeProperty('delete',index)} type="delete" className={styles.delete} /> : null}
                            </li>
                          )
                        })
                      }
                      <li> {config.customMoreProperty ? config.customMoreProperty.props.locale.tips : ''} </li>
                    <li><Button onClick={() => changeProperty('add')}>{config.customMoreProperty ? config.customMoreProperty.props.locale.addButtonLabel : ''} </Button></li>
                  </ul>
                )}
              </FormItem>
              </Card>

              <Card size="small" title="SKU属性编辑" >
                <FormItem
                  {...formItemLayout}
                  label={config.productSize? config.productSize.props.label : ''}
                >
                  {getFieldDecorator('productSize', {
                    initialValue: data.productSize? data.productSize : [],
                    rules: [],
                  })(
                    <Checkbox.Group
                      options={formatLabel(config.productSize? config.productSize.props.dataSource : [])}
                      onChange={values =>onChangeSku(values,'productSize')}
                    />
                  )}
                  <Search
                    placeholder="新增尺码"
                    enterButton="添加"
                    maxLength={50}
                    style={{width:'200px'}}
                    onSearch={value => onAddSize(value)}
                  />
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={config.productColor? config.productColor.props.label : ''}
                >
                  {getFieldDecorator('productColor', {
                    initialValue: data.productColor? data.productColor : [],
                    rules: [],
                  })(
                    <Checkbox.Group onChange={values =>onChangeSku(values,'productColor')}>
                      {
                        config.productColor && config.productColor.props.dataSource.map(option => {
                          return <Checkbox key={option.value} value={option.value} style={{marginBottom: '15px'}}> {option.text}
                          (色值：<div className={styles.outline}><div className={styles.inline} style={{background: option.rgb}}></div></div>）
                          </Checkbox>
                        })
                      }
                    </ Checkbox.Group>
                  )}
                  <div className={styles.colorPicker}>
                    <ColorPicker color={initColor} onChange={changeColorHandler} placement="topRight" />
                  </div>
                  <Search
                    placeholder="新增颜色名称"
                    enterButton="添加"
                    maxLength={50}
                    style={{width:'200px'}}
                    onSearch={value => onAddColor(value)}
                  />
                </FormItem>
                <Table dataSource={data.sku} columns={columns} bordered rowKey={(record, index) => index} pagination={false} />
              </Card>

              <Card size="small" title="商品描述" >
                <FormItem
                  {...formItemLayout}
                  label={config.productImage? config.productImage.props.label : ''}
                >
                  {getFieldDecorator('productImage', {
                    initialValue: data.productImage,
                    rules: [
                      {
                        required: true,
                        message: '请选择产品图片',
                      },
                    ],
                  })(
                    <div>
                      <div className={styles.imgBtn}>
                        <MultiUpload {...multiProps} text="上传图片" />
                      </div>
                      {
                        data.productImage  && data.productImage.length ?
                          <SortableList {...sortProps} /> : ''
                      }
                    </div>
                  )}
                </FormItem>
                <UEditor
                    name="content"
                    height="350"
                    content={data.productPropText == null ? '' : data.productPropText}
                />
              </Card>
              <Card size="small" title="交易信息" extra={<span>完善交易信息，方便买家做出采购决定。</span>} >
              <FormItem
                  {...formItemLayout}
                  label={config.priceUnit ? config.priceUnit.props.label : ''}
                >
                  {getFieldDecorator('priceUnit', {
                    initialValue: data.priceUnit? data.priceUnit : '',
                    rules: [{required: true, message: '请补充该选项'}],
                  })(
                    <Select showSearch style={{width: '50%'}} 
                      optionFilterProp="children"
                      onChange={onEditUnit}
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {
                        config.priceUnit && config.priceUnit.props.dataSource.map((option,_index) => {
                        return <Option value={option.value} key={_index}>{option.text}</Option>
                        })
                      }
                    </Select>
                  )}
                </FormItem>

                <FormItem
                  {...formItemLayout}
                  label={config.ladderPrice ? config.ladderPrice.props.label : ''}
                >
                  {getFieldDecorator('ladderPrice', {
                    initialValue: data.ladderPrice? data.ladderPrice : '',
                    rules: [{required: true, message: '请补充该选项'}],
                  })(
                    <div className={styles.uintCon} >
                      <div className={styles.leftTable}>
                        <Table dataSource={data.ladderPrice} columns={ladderColumns} rowKey={(record, index) => index} pagination={false} />
                        <Button onClick={this.onAddLadder} disabled={data.ladderPrice && data.ladderPrice.length > 3} style={{marginLeft: '10px'}} >新增价格区间</Button><span>（可设置不超过 4 个区间价格）</span>
                      </div>
                      <div className={styles.rightPart} > 
                      <div className={styles.title}>预览 <span style={{color: '#999'}} >({priceUnit== ''? '计量单位' : priceUnit })</span> </div>
                      {
                        ladderValidate.isRangeError || ladderValidate.isPriceError || ladderValidate.isEmpty ? <span style={{marginLeft:'10px'}} >内容为空提示</span> : 
                          <ul className={styles.ladderList}>
                          {
                            data.ladderPrice && data.ladderPrice.map((option,index) => {
                              if(index === data.ladderPrice.length -1) {
                                return <li key={index} className={styles.ladderLi}><div>≥ {option.min_order} </div><div>US $ <span> {option.price} </span></div></li>
                              } else {
                                return <li  key={index} className={styles.ladderLi}><div>{option.min_order} ~ {Number(data.ladderPrice[index+1].min_order) -1} </div><div>US $ <span> {option.price} </span></div></li>
                              }
                            })
                          }
                        </ul>
                      }
                      </div>
                      
                    </div>
                  )}
                  {
                    ladderValidate.isEmpty ? <div className={styles.errorTip} > * 请输入起订量及价格 </div> : null
                  }
                  {
                    ladderValidate.isRangeError ? <div className={styles.errorTip} > * 起订量必须是由小到大 </div> : null
                  }
                  {
                    ladderValidate.isPriceError ? <div className={styles.errorTip} > * 价格必须是由大到小 </div> : null
                  }
                </FormItem>

                {/* <FormItem
                  {...formItemLayout}
                  label={config.paymentMethod? config.paymentMethod.props.label : ''}
                >
                  {getFieldDecorator('paymentMethod', {
                    initialValue: data.paymentMethod? data.paymentMethod : [],
                    rules: [],
                  })(
                    <Checkbox.Group
                      options={formatLabel(config.paymentMethod? config.paymentMethod.props.dataSource : [])}
                      //onChange={values =>onChangeSku(values,'productSize')}
                    />
                  )}
                </FormItem> */}
              </Card>
              
              <Card size="small" title="物流信息" >
                <FormItem
                  {...formItemLayout}
                  label={config.logisticsMode? config.logisticsMode.props.label : ''}
                >
                  {getFieldDecorator('logisticsMode', {
                    initialValue: data.logisticsMode? data.logisticsMode : '',
                    rules: [],
                  })(
                    <Select allowClear style={{width: '50%'}} 
                    >
                      {
                        config.logisticsMode && config.logisticsMode.props.dataSource.map((option,_index) => {
                        return <Option value={option.value} key={_index}>{option.text}</Option>
                        })
                      }
                    </Select>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={config.supply? config.supply.props.label : ''}
                >
                  {getFieldDecorator('supplyNumber', {
                    initialValue: data.supply? data.supply.supplyNumber : '',
                    rules: [],
                  })(
                    <Input style={{width: '200px'}} />
                  )}

                  {getFieldDecorator('measureUnit', {
                    initialValue: data.supply? data.supply.measureUnit: undefined,
                    rules: [],
                  })(
                    <Select allowClear showSearch style={{width: '150px'}} 
                      placeholder="请选择"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {
                        config.supply && config.supply.props.measureUnits.map((option,_index) => {
                        return <Option value={option.value} key={_index}>{option.text}</Option>
                        })
                      }
                    </Select>
                  )}
                  <span style={{padding: '0 6px'}} >per</span>
                  {getFieldDecorator('timeUnit', {
                    initialValue: data.supply? data.supply.timeUnit: undefined,
                    rules: [],
                  })(
                    <Select allowClear showSearch style={{width: '150px'}} 
                      placeholder="请选择"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {
                        config.supply && config.supply.props.timeUnits.map((option,_index) => {
                        return <Option value={option.value} key={_index}>{option.text}</Option>
                        })
                      }
                    </Select>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={config.packagingImage? config.packagingImage.props.label : ''}
                >
                  {getFieldDecorator('packagingImage', {
                    initialValue: data.packagingImage? data.packagingImage : '',
                    rules: [],
                  })(
                    <div>
                      <div className={styles.imgBtn}>
                        <MultiUpload {...multiPackProps} text="上传图片" />
                      </div>
                      <ul className={styles.packImgList} >
                        {
                          data.packagingImage && data.packagingImage.map((option,index) => {
                            return <li key={index} ><img src={option.image_url} /></li>
                          })
                        } 
                      </ul>
                    </div>
                  )}
                  
                </FormItem>
              </Card>
              <FormItem
                {...submitFormLayout}
                style={{
                  marginTop: 32,
                }}
              >
                <Button type="primary" htmlType="submit" loading={submitting}>
                  <FormattedMessage id="formandbasic-form.form.submit" />
                </Button>
                {/* <Button
                  style={{
                    marginLeft: 8,
                  }}
                >
                  <FormattedMessage id="formandbasic-form.form.save" />
                </Button> */}
              </FormItem>
            </Form>
          </Card>
      );
    }
  }
  
  export default Form.create()(
    connect(({ productDetail,loading }) => ({
        productDetail,
        submitting: loading.effects['formAndbasicForm/submitRegularForm'],
    }))(BasicForm),
  );
  