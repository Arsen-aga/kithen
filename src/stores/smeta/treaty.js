export const useTreaty = (smeta) => {
  const changeDelivery = (activeItem) => {
    smeta.value.Order_delivery.forEach(item => {
      if(item.p_id === activeItem.p_id) item.selected = 1;
      else item.selected = 0
    });
    console.log('smeta.value', smeta.value);
  }
  const changePromotion = (activeItem) => {
    smeta.value.Order_Promotion.forEach(item => {
      if(item.p_id === activeItem.p_id) item.selected = 1;
      else item.selected = 0
    });
    console.log('smeta.value', smeta.value);
  }
  const changePayment = (activeItem) => {
    smeta.value.Order_PaymentMethod.forEach(item => {
      if(item.p_id === activeItem.p_id) item.selected = 1;
      else item.selected = 0
    });
    console.log('smeta.value', smeta.value);
  }

  return {
    changeDelivery,
    changePromotion,
    changePayment,
  }
}