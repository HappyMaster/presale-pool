import React, { Component } from 'react';
import logo from './logo.svg';
// import './Header.css';

class Header extends Component {
  render() {
    return (
      <header>
        <div className="container-fluid">
          <div className="row">
              <div className="col-xs-12">
                  <div className="logo">EtherPool</div>
                  <div className="input-search">
                      <input type="text" placeholder="Enter a wallet address to find a pool" />
                      <button>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                              <path fill="white" fillRule="nonzero" d="M5.6 0A5.567 5.567 0 0 0 0 5.6c0 3.119 2.481 5.6 5.6 5.6a5.59 5.59 0 0 0 3.6-1.3l.4.4v.65L14.65 16 16 14.65 10.95 9.6h-.7l-.375-.375A5.598 5.598 0 0 0 11.2 5.6C11.2 2.481 8.719 0 5.6 0zm0 1.6c2.24 0 4 1.76 4 4s-1.76 4-4 4-4-1.76-4-4 1.76-4 4-4z"/>
                          </svg>
                      </button>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                          <path fill="#1B2C59" fillRule="nonzero" d="M5.6 0A5.567 5.567 0 0 0 0 5.6c0 3.119 2.481 5.6 5.6 5.6a5.59 5.59 0 0 0 3.6-1.3l.4.4v.65L14.65 16 16 14.65 10.95 9.6h-.7l-.375-.375A5.598 5.598 0 0 0 11.2 5.6C11.2 2.481 8.719 0 5.6 0zm0 1.6c2.24 0 4 1.76 4 4s-1.76 4-4 4-4-1.76-4-4 1.76-4 4-4z"/>
                      </svg>
                  </div>
                  <ul className="usermenu">
                      <li>
                          <a href="#">STATS</a>
                      </li>
                      <li className="usermenu-selected">
                          <a href="#">FAQ</a>
                      </li>
                      <li>
                          <a href="#">INVESTOR
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="7" viewBox="0 0 16 7">
                                  <path fill="#1B2C59" fillRule="nonzero" d="M0 0v3.111L8 7l8-3.889V0L8 3.889z"/>
                              </svg>
                          </a>
                      </li>
                  </ul>
              </div>
          </div>
        </div>
      </header>
    );
  }
}

export default Header;
