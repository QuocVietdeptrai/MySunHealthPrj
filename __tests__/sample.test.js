const { login, loginPost } = require('../controllers/admin/account.controller');
const AccountAdmin = require('../models/account-admin.model');
const { getMockReq, getMockRes } = require('@jest-mock/express');
const mockingoose = require('mockingoose');
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');

describe('Account Controller - Login', () => {
  beforeEach(() => {
    mockingoose(AccountAdmin).reset();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should render login page', async () => {
      const req = getMockReq();
      const { res } = getMockRes({ render: jest.fn() });

      await login(req, res);

      expect(res.render).toHaveBeenCalledWith('admin/pages/login', {
        pageTitle: 'Đăng nhập'
      });
    });
  });

  describe('loginPost', () => {
    it('should return error if email does not exist', async () => {
      mockingoose(AccountAdmin).toReturn(null, 'findOne');
      const req = getMockReq({
        body: {
          email: 'notfound@example.com',
          password: 'any',
        }
      });
      const { res } = getMockRes({ json: jest.fn() });

      await loginPost(req, res);

      expect(res.json).toHaveBeenCalledWith({
        code: 'error',
        message: 'Email không tồn tại trong hệ thống !'
      });
    });

    it('should return error if password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('correctPassword', 10);

      const mockAccount = {
        email: 'test@example.com',
        password: hashedPassword,
        status: 'active'
      };

      mockingoose(AccountAdmin).toReturn(mockAccount, 'findOne');

      const req = getMockReq({
        body: {
          email: mockAccount.email,
          password: 'wrongPassword',
        }
      });
      const { res } = getMockRes({ json: jest.fn() });

      await loginPost(req, res);

      expect(res.json).toHaveBeenCalledWith({
        code: 'error',
        message: 'Mật khẩu không đúng !'
      });
    });

    it('should return error if account is not active', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);

      const mockAccount = {
        email: 'test@example.com',
        password: hashedPassword,
        status: 'inactive'
      };

      mockingoose(AccountAdmin).toReturn(mockAccount, 'findOne');

      const req = getMockReq({
        body: {
          email: mockAccount.email,
          password: 'password123',
        }
      });
      const { res } = getMockRes({ json: jest.fn() });

      await loginPost(req, res);

      expect(res.json).toHaveBeenCalledWith({
        code: 'error',
        message: 'Tài khoản chưa được kích hoạt !'
      });
    });

    it('should login successfully and set cookie', async () => {
      const passwordPlain = 'password123';
      const passwordHashed = await bcrypt.hash(passwordPlain, 10);

      const mockAccount = {
        _id: '6829ac0201838904b45cad2f',
        email: 'nguyenquocviet2004tb12@gmail.com',
        password: passwordHashed,
        status: 'active'
      };

      const tokenMock = 'mocked-jwt-token';
      jest.spyOn(jwt, 'sign').mockReturnValue(tokenMock);

      mockingoose(AccountAdmin).toReturn(mockAccount, 'findOne');

      const cookieMock = jest.fn();
      const jsonMock = jest.fn();

      const req = getMockReq({
        body: {
          email: mockAccount.email,
          password: passwordPlain,
          rememberPassword: true
        }
      });

      const { res } = getMockRes({
        cookie: cookieMock,
        json: jsonMock
      });

      await loginPost(req, res);

      expect(cookieMock).toHaveBeenCalledWith(
        'token',
        tokenMock,
        expect.objectContaining({
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: 'strict'
        })
      );

      expect(jsonMock).toHaveBeenCalledWith({
        code: 'success',
        message: 'Đăng nhập tài khoản thành công'
      });
    });
  });
});
