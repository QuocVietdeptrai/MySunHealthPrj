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

  describe('loginPost', () => {
    it('Email không tồn tại trong hệ thống', async () => {
      mockingoose(AccountAdmin).toReturn((query) => {
        const { email } = query.getQuery();
        if (email === 'found@example.com') {
          return {
            email: 'found@example.com',
            password: 'hashedpassword',
            status: 'active'
          };
        }
        return null;
      }, 'findOne');

      const req = getMockReq({
        body: {
          email: 'notfound@example.com', // không trùng email mock
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



    it('Mật khẩu không đúng', async () => {
    const email = 'test@example.com';
    const correctPassword = 'correctPassword';
    const wrongPassword = 'wrongPassword';
    const hashedPassword = await bcrypt.hash(correctPassword, 10);

    // Mock findOne có điều kiện email
    mockingoose(AccountAdmin).toReturn((query) => {
      if (query.getQuery().email === email) {
        return {
          email,
          password: hashedPassword,
          status: 'active'
        };
      }
      return null;
    }, 'findOne');

    const req = getMockReq({
      body: {
        email: email,
        password: wrongPassword, // cung cấp sai password
      }
    });

    const { res } = getMockRes({ json: jest.fn() });

    await loginPost(req, res);

    expect(res.json).toHaveBeenCalledWith({
      code: 'error',
      message: 'Mật khẩu không đúng !'
    });
  });


    it('Tài khoản chưa được kích hoạt', async () => {
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

    it('Đăng nhập tài khoản thành công', async () => {
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
