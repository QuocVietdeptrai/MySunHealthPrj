const { create, createPost } = require('../controllers/admin/tour.controller');
const Category = require('../models/category.model');
const City = require('../models/cities.model');
const Tour = require('../models/tour.model');
const { getMockReq, getMockRes } = require('@jest-mock/express');
const mockingoose = require('mockingoose');
const categoryHelper = require('../helpers/category.helper');

describe('Tour Controller', () => {
  beforeAll(() => {
    global.pathAdmin = 'admin';
  });

  beforeEach(() => {
    mockingoose(Category).reset();
    mockingoose(City).reset();
    mockingoose(Tour).reset();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should render create page if user has permission', async () => {
      const req = getMockReq({
        permissions: ['tour-create'],
      });
      const { res } = getMockRes({ render: jest.fn() });

      const categories = [{ _id: "67ff60975d1d3b772fe52f37", name: 'Tour Miền Bắc', deleted: false }];
      const cities = [
        { _id: "6814eaaf99249630be5d2afc", name: 'City1' },
        { _id: "6814eaaf99249630be5d2afe", name: 'Hải Phòng' },
        { _id: "6814eaaf99249630be5d2b2c", name: 'Quảng Ninh' },
      ];
      const categoryTree = [{ _id: 1, name: 'Cat1', children: [] }];

      mockingoose(Category).toReturn(categories, 'find');
      mockingoose(City).toReturn(cities, 'find');
      jest.spyOn(categoryHelper, 'buildCategoryTree').mockReturnValue(categoryTree);

      await create(req, res);

      expect(res.render).toHaveBeenCalledWith('admin/pages/tour-create', {
        pageTitle: 'Tạo tour',
        categoryList: categoryTree,
        cityList: cities,
      });
    });

    it('should redirect if user does not have permission', async () => {
      const flashMock = jest.fn();
      const redirectMock = jest.fn();
      const req = getMockReq({
        permissions: [],
        flash: flashMock,
      });
      const { res } = getMockRes({ redirect: redirectMock });

      await create(req, res);

      expect(flashMock).toHaveBeenCalledWith('error', 'Bạn không có quyền tạo tour!');
      expect(redirectMock).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  describe('createPost', () => {
    it('should create a new tour and return success JSON', async () => {
      const flashMock = jest.fn();
      const jsonMock = jest.fn();
      const req = getMockReq({
        permissions: ['tour-create'],
        account: { id: 'user123' },
        file: { path: 'avatar.jpg' },
        body: {
          priceAdult: '1000',
          priceChildren: '500',
          priceBaby: '200',
          locations: JSON.stringify(['loc1', 'loc2']),
          departureDate: '2025-01-01',
          schedules: JSON.stringify([{ day: 1, activity: 'activity' }]),
        },
        flash: flashMock,
      });

      const { res } = getMockRes({ json: jsonMock });

      mockingoose(Tour).toReturn(5, 'countDocuments');
      mockingoose(Tour).toReturn({
        _id: 'mocked-tour-id',
        ...req.body,
        avatar: req.file.path,
        account: req.account.id,
      }, 'save');

      await createPost(req, res);

      expect(flashMock).toHaveBeenCalledWith('success', 'Tạo tour thành công!');
      expect(jsonMock).toHaveBeenCalledWith({ code: 'success' });
    });

    it('should return error JSON if no permission', async () => {
      const flashMock = jest.fn();
      const jsonMock = jest.fn();
      const req = getMockReq({
        permissions: [],
        flash: flashMock,
      });

      const { res } = getMockRes({ json: jsonMock });

      await createPost(req, res);

      expect(flashMock).toHaveBeenCalledWith('error', 'Bạn không có quyền tạo tour!');
      expect(jsonMock).toHaveBeenCalledWith({
        code: 'error',
        message: 'Bạn không có quyền tạo tour!',
      });
    });
  });
});
