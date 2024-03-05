import React from 'react'
import './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
        <div className="descriptionbox-navigator">
            <div className="descriptionbox-nav-box">Description</div>
            <div className="descriptionbox-nav-box fade">Reviews (122)</div>
        </div>
        <div className="descriptionbox-description">
            <p>
            An e-commerce website is an online platform where businesses and individuals can buy and sell goods and services over the internet. 
            These websites typically feature a user-friendly interface that allows customers to browse through products or services, add them to a virtual shopping cart, and complete transactions securely using various payment methods.
            </p>
            <p>
            Overall, e-commerce websites serve as digital marketplaces that facilitate buying and selling activities, offering convenience and accessibility to both businesses and consumers worldwide.
            </p>
        </div>
    </div>
  )
}

export default DescriptionBox