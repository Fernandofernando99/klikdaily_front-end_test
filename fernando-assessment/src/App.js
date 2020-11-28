import './App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import products from './assets/productsData';
import Swal from 'sweetalert2';

function App() {
  const [orderState, setOrderState] = useState({
    orderName: '',
    distributionCenter: '',
    notes: '',
    paymentType: '',
    expiredDate: '',
    productsChosen: [
      {
        productName: '',
        productUnit: '',
        productPrice: '',
        productQty: '',
        productTotalPrice: ''
      }
    ]
  })
  const [nameList, setNameList] = useState([])

  useEffect(() => {
    fetchOrderName()
  }, [])

  const fetchOrderName = () => {
    axios({
      url: 'http://dummy.restapiexample.com/api/v1/employees',
      method: 'GET'
    })
      .then(({data}) => {
        setNameList(data.data)
      })
      .catch(err => {
        console.log(err);
        Swal.fire({
          title: `${err}`,
          text: `Please refresh the page until the API ready, or continue using test name provided in the select option`,
          icon: 'error',
          confirmButtonText: 'Ok'
        })
      })
      .finally(done => {
        console.log("Fetch Order Name Done");
      })
  }

  const handleInputChange = (e) => {
    const { value, name } = e.target
    if ( name === 'expiredDate' ) {
      let dateNow = new Date()
      if ( new Date(value) < dateNow ) {
        return  Swal.fire({
          title: `Error!`,
          text: `Please set expired date to tomorrow at least`,
          icon: 'error',
          confirmButtonText: 'Ok'
        })
      }
    } else if ( name === 'orderName' ) {
      if (value === '') {
        return setOrderState({
          orderName: '',
          distributionCenter: '',
          notes: '',
          paymentType: '',
          expiredDate: '',
          productsChosen: [
            {
              productName: '',
              productUnit: '',
              productPrice: '',
              productQty: '',
              productTotalPrice: ''
            }
          ]
        })
      }
    }
    return setOrderState({...orderState, [name]: value})
  }

  const showUnitOption = (index) => {
    let productIndex = products.findIndex(prod => {
      return prod.product_name === orderState.productsChosen[index].productName
    })
    let unitToChoose = products[productIndex].units.map(unit => {
      return unit.name
    })
    let takenUnit = []
    orderState.productsChosen.forEach(unit => {
      if (unit.productName === orderState.productsChosen[index].productName && unit.productUnit !== '') {
        takenUnit.push(unit.productUnit)
      }
    })
    let freeUnit = unitToChoose.filter(unit => {
      return !takenUnit.includes(unit) 
    })
    return (
      <>
        { freeUnit.map((unit, index) => {
            return <option key={index} value={unit}>{unit}</option> 
          })
        }
        <option hidden={orderState.productsChosen[index].productUnit === '' ? true : false} defaultValue>{orderState.productsChosen[index].productUnit}</option>
      </>
    )
  }

  const handleProductNameChange = (index, e) => {
    const { value, name } = e.target
    const prodObj = [...orderState.productsChosen]
    prodObj[index][name] = value
    prodObj[index].productPrice = ''
    prodObj[index].productUnit = ''
    prodObj[index].productQty = ''
    prodObj[index].productTotalPrice = ''
    setOrderState({...orderState, productsChosen: prodObj})
  }

  const handleProductUnitChange = (index, e) => {
    const { value, name } = e.target
    const prodObj = [...orderState.productsChosen]
    prodObj[index][name] = value
    prodObj[index]['productQty'] = ''
    prodObj[index]['productTotalPrice'] = ''
    if (value !== '' ) {
      let unitIndex = products.findIndex(prod => {
        return prod.product_name === orderState.productsChosen[index].productName
      })
      let price = 0 
      products[unitIndex].units.forEach(unit => {
        if (unit.name === value) {
          price = unit.price
        }
      })
      prodObj[index]['productPrice'] = price
    } else {
      prodObj[index]['productPrice'] = ''
    }
    setOrderState({...orderState, productsChosen: prodObj})
  }

  const handleProductQtyChange = (index, e) => {
    const { name, value } = e.target
    if ( value < 0 ) {
      return  Swal.fire({
        title: `Error!`,
        text: `Only accept positive number`,
        icon: 'error',
        confirmButtonText: 'Ok'
      })
    }
    const prodObj = [...orderState.productsChosen]
    prodObj[index][name] = value
    if (prodObj[index]['productPrice'] !== '') {
      prodObj[index]['productTotalPrice'] = value * prodObj[index]['productPrice'] 
    } else {
      prodObj[index]['productTotalPrice'] = ''
    }
    setOrderState({...orderState, productsChosen: prodObj})
  }

  const showGrandTotalPrice = () => {
    let total = 0
    orderState.productsChosen.forEach(prod => {
      if (prod.productTotalPrice !== '') {
        total += prod.productTotalPrice
      }
    })
    return new Intl.NumberFormat('id-ID').format(total) 
  }

  const addNewProduct = () => {
    let newProduct = {
      productName: '',
      productUnit: '',
      productPrice: '',
      productQty: '',
      productTotalPrice: ''
    }
    setOrderState({...orderState, productsChosen: orderState.productsChosen.concat(newProduct)})
  }

  const confirmButtonDisableStatus = () => {
    let isNotFulfilled = false
    for (const key in orderState) {
      if (orderState[key] === '' && key !== 'productChosen') {
        isNotFulfilled = true
      }
    }
    orderState.productsChosen.forEach(prod => {
      for (const key in prod) {
        if (prod[key] === '') {
          isNotFulfilled = true
        }
      }
    })
    return isNotFulfilled
  }

  return (
    <div className="pb-3" style={{backgroundColor: "#f6f6f6"}}>
      <h6 className="ml-4 pt-3"><b>Create Order</b></h6>
      <div className="mt-2 mb-2 ml-3 mr-3" style={{backgroundColor: "white"}}>
        <div className="row container pt-2">
          <div className="col-3">
            <h6><b>Detail</b></h6>
          </div>
          <div className="col-9">
            <form>
              <div className="form-group">
                <label htmlFor="orderName">Name*</label>
                <select className="custom-select" name="orderName" onChange={(e) => handleInputChange(e)}>
                  <option defaultValue value="">Name</option>
                  {
                    nameList.length > 0 &&
                    nameList?.map((employee) => {
                      return <option key={employee.id} value={employee.employee_name}>{employee.employee_name}</option>
                    })
                  }
                  <option value="test">Test</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="orderDistribution">Distribution Center*</label>
                <select className="custom-select" name='distributionCenter' onChange={(e) => handleInputChange(e)}>
                  {
                    orderState.orderName === ''
                    ? <option defaultValue>No Data Available</option>
                    : <> 
                        <option defaultValue value=''>Distribution Center</option>
                        <option value="tangerang">DC Tangerang</option>
                        <option value="cikarang">DC Cikarang</option>
                      </>   
                  }
                </select>
              </div>
              {
                orderState.orderName !== "" && orderState.distributionCenter !== "" &&
                <>
                <div className="form-row">
                  <div className="col">
                    <label htmlFor="paymentType">Payment Type*</label>
                    <select required className="custom-select" value={orderState.paymentType} name="paymentType" onChange={(e) => handleInputChange(e)}>
                      <option defaultValue value="">Payment Type</option>
                      <option value="cashH1">Cash H+1</option>
                      <option value="cashH3">Cash H+3</option>
                      <option value="cashH7">Cash H+7</option>
                      <option value="transferH1">Transfer H+1</option>
                      <option value="transferH3">Transfer H+3</option>
                      <option value="transferH7">Transfer H+7</option>
                    </select>
                  </div>
                  <div className="col">
                    <label htmlFor="expiredDate">Expired Date*</label><br></br>
                    <input required type="date" name="expiredDate" value={orderState.expiredDate}
                    onChange={(e) => handleInputChange(e)}  className="form-control"></input>
                  </div>
                </div>
                <div className="form-group mt-3">
                  <label htmlFor="orderNotes">Notes</label>
                  <textarea required value={orderState.notes} onChange={(e) => handleInputChange(e)} className="form-control" name='notes' id="orderNotes" rows="5"></textarea>
                </div>
                </>
              }
              
            </form>
          </div>
        </div>
        {
          orderState.orderName !== "" && orderState.distributionCenter !== "" &&
          <>
            <hr></hr>
            <div className="row container pt-2">
              <div className="col-3">
                <h6><b>Products</b></h6>
              </div>
              <div className="col-9">
                <form>
                {
                  orderState.productsChosen.map((prod, index) => {
                    return <div key={index}>
                      <div className="form-row">
                        <div className="col-8">
                          <label htmlFor="productName">Product*</label>
                          <select value={orderState.productsChosen[index].productName} className="custom-select" name="productName" onChange={(e) => handleProductNameChange(index, e)}>
                            <option defaultValue value="">Product Name</option>
                            {
                              products?.map((prod, index) => {
                                return <option key={index} value={prod.product_name}>{prod.product_name}</option>
                              })
                            }
                          </select>
                        </div>
                        <div className="col-4">
                          <label htmlFor="productUnit">Unit*</label><br></br>
                          <select value={orderState.productsChosen[index].productUnit} className="custom-select" name="productUnit" onChange={(e) => handleProductUnitChange(index, e)}>
                            <option defaultValue value="">Unit</option>
                            {
                              orderState.productsChosen[index].productName === ''
                              ? <option value="">No Data Available</option>
                              : showUnitOption(index)
                            }
                          </select>
                        </div>
                      </div>
                      <div className="form-row mt-3 mb-3">
                        <div className="col-3">
                          <label htmlFor="productQty">Quantity*</label><br></br>
                          <input className="form-control" placeholder="Quantity" type="number" value={orderState.productsChosen[index].productQty} min={0} name="productQty" onChange={(e) => handleProductQtyChange(index, e)}></input>
                        </div>
                        <div className="col-3">
                          <label htmlFor="productPrice">Price*</label><br></br>
                          <input className="form-control" value={orderState.productsChosen[index].productPrice}  type="number" name="productPrice" onChange={(e) => handleInputChange(e)}></input>
                        </div>
                        <div className="col-6" style={{textAlign: "right"}}>
                          <label htmlFor="productTotalPrice">Total Price*</label><br></br>
                          <input style={{textAlign: "right"}} disabled={true} value={orderState.productsChosen[index].productTotalPrice} className="form-control" placeholder="-" type="number" name="productTotalPrice"></input>
                        </div>
                      </div>
                      <div className=" col-6 ml-auto">
                        <hr></hr>
                        <div className='container row'>
                          <p><b>Total Nett Price</b></p>
                          <p className="ml-auto"><b>{orderState.productsChosen[index].productTotalPrice === '' ? 0 : new Intl.NumberFormat('id-ID').format(orderState.productsChosen[index].productTotalPrice)  }</b></p>
                        </div>
                      </div>
                    </div>
                  })
                }
                  <div className="row mt-2">
                    <div className="col-6 d-flex container align-items-center" style={{height: "200px"}}>
                      <button type="button" onClick={() => addNewProduct()} className="btn btn-warning text-white">NEW ITEM +</button>
                    </div>
                    <div className="col-6 d-flex align-items-end" style={{height: "200px"}}>
                      <div className="container row">
                        <p><b>Total </b></p>
                        <p className=" ml-auto"><b>{showGrandTotalPrice()}</b></p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </>
        }
        <hr></hr>
        <div className="container pb-4 d-flex flex-row justify-content-end">
          <button type="button" className="btn btn-light mr-2">Cancel</button>
          <button disabled={confirmButtonDisableStatus()} type="submit" className="btn btn-success">Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default App;
