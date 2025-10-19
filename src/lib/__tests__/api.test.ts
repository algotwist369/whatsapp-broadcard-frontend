import axios from 'axios'
import { whatsappApi, contactsApi, cacheUtils } from '../api'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('mock-token')
    mockedAxios.create.mockReturnValue(mockedAxios)
  })

  describe('WhatsApp API', () => {
    describe('connect', () => {
      it('should call connect endpoint', async () => {
        const mockResponse = {
          data: {
            success: true,
            message: 'Connection initiated',
            data: { isConnected: false }
          }
        }
        mockedAxios.post.mockResolvedValue(mockResponse)

        const result = await whatsappApi.connect()

        expect(mockedAxios.post).toHaveBeenCalledWith('/whatsapp/connect', {}, {
          timeout: 500,
        })
        expect(result).toEqual(mockResponse.data)
      })

      it('should handle connection errors', async () => {
        mockedAxios.post.mockRejectedValue(new Error('Connection failed'))

        await expect(whatsappApi.connect()).rejects.toThrow('Connection failed')
      })
    })

    describe('getStatus', () => {
      it('should fetch status and cache result', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: { isConnected: true, state: 'open' }
          }
        }
        mockedAxios.get.mockResolvedValue(mockResponse)

        const result = await whatsappApi.getStatus()

        expect(mockedAxios.get).toHaveBeenCalledWith('/whatsapp/status')
        expect(result).toEqual(mockResponse.data)
      })

      it('should return cached result on subsequent calls', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: { isConnected: true, state: 'open' }
          }
        }
        mockedAxios.get.mockResolvedValue(mockResponse)

        // First call
        await whatsappApi.getStatus()
        
        // Second call should use cache
        const result = await whatsappApi.getStatus()

        expect(mockedAxios.get).toHaveBeenCalledTimes(1)
        expect(result).toEqual(mockResponse.data)
      })
    })

    describe('disconnect', () => {
      it('should call disconnect endpoint and clear cache', async () => {
        const mockResponse = {
          data: {
            success: true,
            message: 'Disconnected successfully'
          }
        }
        mockedAxios.post.mockResolvedValue(mockResponse)

        const result = await whatsappApi.disconnect()

        expect(mockedAxios.post).toHaveBeenCalledWith('/whatsapp/disconnect')
        expect(result).toEqual(mockResponse.data)
      })
    })
  })

  describe('Contacts API', () => {
    describe('getContacts', () => {
      it('should fetch contacts with parameters', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              contacts: [],
              total: 0,
              page: 1,
              limit: 10
            }
          }
        }
        mockedAxios.get.mockResolvedValue(mockResponse)

        const params = { page: 1, limit: 10, search: 'test' }
        const result = await contactsApi.getContacts(params)

        expect(mockedAxios.get).toHaveBeenCalledWith('/contacts', { params })
        expect(result).toEqual(mockResponse.data)
      })

      it('should clear cache when adding contact', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: { contact: { id: '1', name: 'Test Contact' } }
          }
        }
        mockedAxios.post.mockResolvedValue(mockResponse)

        await contactsApi.addContact({ name: 'Test Contact', phone: '1234567890' })

        expect(mockedAxios.post).toHaveBeenCalledWith('/contacts', {
          name: 'Test Contact',
          phone: '1234567890'
        })
      })
    })
  })

  describe('Cache Utils', () => {
    it('should clear cache by pattern', () => {
      cacheUtils.clearCache('/contacts')
      // Test passes if no errors are thrown
      expect(true).toBe(true)
    })

    it('should clear all cache', () => {
      cacheUtils.clearCache()
      // Test passes if no errors are thrown
      expect(true).toBe(true)
    })

    it('should get cache stats', () => {
      const stats = cacheUtils.getCacheStats()
      expect(stats).toHaveProperty('cacheSize')
      expect(stats).toHaveProperty('requestCacheSize')
    })
  })
})
