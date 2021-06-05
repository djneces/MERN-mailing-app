import React, { Component } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { connect } from 'react-redux';
import * as actions from '../actions';

export class Payments extends Component {
  render() {
    return (
      <StripeCheckout
        name='Emaily'
        description='$5 for 5 emails'
        amount={500}
        token={(token) => this.props.handleToken(token)}
        stripeKey={process.env.REACT_APP_STRIPE_KEY}
      >
        {/* child component helps styling  */}
        <button className='btn'>Add Credits</button>
      </StripeCheckout>
    );
  }
}

export default connect(null, actions)(Payments);
