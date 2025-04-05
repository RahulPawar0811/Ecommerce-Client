import React from 'react'

function ForgetPassword() {
  return (
<div id="single-wrapper">
  <form action="#" className="frm-single">
    <div className="inside">
      <div className="title"><strong>Ninja</strong>Admin</div>
      {/* /.title */}
      <div className="frm-title">Reset Password</div>
      {/* /.frm-title */}
      <p className="text-center">Enter your email address and we'll send you an email with instructions to reset your password.</p>
      <div className="frm-input"><input type="email" placeholder="Enter Email" className="frm-inp" /><i className="fa fa-envelope frm-ico" /></div>
      {/* /.frm-input */}
      <button type="submit" className="frm-submit">Send Email<i className="fa fa-arrow-circle-right" /></button>
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

export default ForgetPassword