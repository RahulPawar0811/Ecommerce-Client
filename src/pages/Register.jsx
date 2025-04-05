import React from 'react'

function Register() {
  return (
<div id="single-wrapper">
  <form action="#" className="frm-single">
    <div className="inside">
      <div className="title"><strong>Ninja</strong>Admin</div>
      {/* /.title */}
      <div className="frm-title">Register</div>
      {/* /.frm-title */}
      <div className="frm-input"><input type="email" placeholder="Email" className="frm-inp" /><i className="fa fa-envelope frm-ico" /></div>
      {/* /.frm-input */}
      <div className="frm-input"><input type="text" placeholder="Username" className="frm-inp" /><i className="fa fa-user frm-ico" /></div>
      {/* /.frm-input */}
      <div className="frm-input"><input type="password" placeholder="Password" className="frm-inp" /><i className="fa fa-lock frm-ico" /></div>
      {/* /.frm-input */}
      <div className="clearfix margin-bottom-20">
        <div className="checkbox primary"><input type="checkbox" id="accept" /><label htmlFor="accept">I accept Terms and Conditions</label></div>
        {/* /.checkbox */}
      </div>
      {/* /.clearfix */}
      <button type="submit" className="frm-submit">Register<i className="fa fa-arrow-circle-right" /></button>
      <div className="row small-spacing">
        <div className="col-md-12">
          <div className="txt-login-with txt-center">or register with</div>
          {/* /.txt-login-with */}
        </div>
        {/* /.col-md-12 */}
        <div className="col-md-6"><button type="button" className="btn btn-sm btn-icon btn-icon-left btn-social-with-text btn-facebook text-white waves-effect waves-light"><i className="ico fa fa-facebook" /><span>Facebook</span></button></div>
        {/* /.col-md-6 */}
        <div className="col-md-6"><button type="button" className="btn btn-sm btn-icon btn-icon-left btn-social-with-text btn-google-plus text-white waves-effect waves-light"><i className="ico fa fa-google-plus" />Google+</button></div>
        {/* /.col-md-6 */}
      </div>
      {/* /.row */}
      <a href="page-login.html" className="a-link"><i className="fa fa-sign-in" />Already have account? Login.</a>
      <div className="frm-footer">NinjaAdmin © 2016.</div>
      {/* /.footer */}
    </div>
    {/* .inside */}
  </form>
  {/* /.frm-single */}
</div>
  )
}

export default Register