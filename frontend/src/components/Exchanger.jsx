import React, { useEffect, useState } from 'react';
import ExchangeLogic from './ExchangeLogic';

const Exchanger = (props) => {
    const [value, setValue] = useState(1);
    return (
        <div className="exchange">
          <strong> Buy {props.data.buy} for {props.data.sell} </strong>
          <br></br>
          <input
              type="number"
              value={value}
              onChange={event => 
                setValue(event.target.value)
                
              }
          />
          <ExchangeLogic data = {{tokenName : props.data.tokenName, sellingToken : (props.data.tokenName === props.data.sell), value : value, price: props.data.price}}/>
        </div>
    )
  }
export default Exchanger;