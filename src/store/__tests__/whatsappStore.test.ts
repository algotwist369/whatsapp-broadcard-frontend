import { renderHook, act } from '@testing-library/react'
import { useWhatsAppStore } from '../whatsappStore'
import { whatsappApi } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api', () => ({
  whatsappApi: {
    getStatus: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    getQR: jest.fn(),
    sendTestMessage: jest.fn(),
  },
}))

const mockWhatsappApi = whatsappApi as jest.Mocked<typeof whatsappApi>

describe('WhatsApp Store', () => {
  beforeEach(() => {
    // Reset store state
    useWhatsAppStore.setState({
      status: null,
      isConnected: false,
      isLoading: false,
      qrCode: null,
      pollingInterval: null,
      statusCheckInterval: null,
      websocketActive: false,
    })
    
    // Clear all mocks
    jest.clearAllMocks()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })
  })

  describe('setStatus', () => {
    it('should update status when values change', () => {
      const { result } = renderHook(() => useWhatsAppStore())

      act(() => {
        result.current.setStatus({
          isConnected: true,
          state: 'open',
          qr: null
        })
      })

      expect(result.current.status).toEqual({
        isConnected: true,
        state: 'open',
        qr: null
      })
      expect(result.current.isConnected).toBe(true)
    })

    it('should not update when values are the same', () => {
      const { result } = renderHook(() => useWhatsAppStore())

      // Set initial status
      act(() => {
        result.current.setStatus({
          isConnected: true,
          state: 'open',
          qr: null
        })
      })

      const initialStatus = result.current.status

      // Set same status again
      act(() => {
        result.current.setStatus({
          isConnected: true,
          state: 'open',
          qr: null
        })
      })

      expect(result.current.status).toBe(initialStatus)
    })
  })

  describe('fetchStatus', () => {
    it('should fetch status successfully', async () => {
      const mockStatus = {
        success: true,
        data: {
          isConnected: true,
          state: 'open',
          qr: null
        }
      }

      mockWhatsappApi.getStatus.mockResolvedValue(mockStatus)

      const { result } = renderHook(() => useWhatsAppStore())

      await act(async () => {
        await result.current.fetchStatus()
      })

      expect(mockWhatsappApi.getStatus).toHaveBeenCalled()
      expect(result.current.status).toEqual(mockStatus.data)
      expect(result.current.isConnected).toBe(true)
    })

    it('should handle fetch errors gracefully', async () => {
      mockWhatsappApi.getStatus.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useWhatsAppStore())

      await act(async () => {
        await result.current.fetchStatus()
      })

      expect(mockWhatsappApi.getStatus).toHaveBeenCalled()
      // Should not throw error
      expect(result.current.status).toBeNull()
    })

    it('should skip fetch if WebSocket is active', async () => {
      const { result } = renderHook(() => useWhatsAppStore())

      // Set WebSocket as active
      act(() => {
        useWhatsAppStore.setState({ websocketActive: true })
      })

      await act(async () => {
        await result.current.fetchStatus()
      })

      expect(mockWhatsappApi.getStatus).not.toHaveBeenCalled()
    })
  })

  describe('connect', () => {
    it('should initiate connection', async () => {
      const mockResponse = {
        success: true,
        message: 'Connection initiated',
        qr: 'data:image/png;base64,mock-qr-code'
      }

      mockWhatsappApi.connect.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useWhatsAppStore())

      let connectResult: any
      await act(async () => {
        connectResult = await result.current.connect()
      })

      expect(mockWhatsappApi.connect).toHaveBeenCalled()
      expect(connectResult.success).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle connection timeout', async () => {
      const timeoutError = new Error('timeout')
      timeoutError.name = 'ECONNABORTED'

      mockWhatsappApi.connect.mockRejectedValue(timeoutError)

      const { result } = renderHook(() => useWhatsAppStore())

      let connectResult: any
      await act(async () => {
        connectResult = await result.current.connect()
      })

      expect(connectResult.success).toBe(true)
      expect(connectResult.message).toContain('Connection initiated')
    })
  })

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Disconnected successfully'
      }

      mockWhatsappApi.disconnect.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useWhatsAppStore())

      let disconnectResult: any
      await act(async () => {
        disconnectResult = await result.current.disconnect()
      })

      expect(mockWhatsappApi.disconnect).toHaveBeenCalled()
      expect(disconnectResult.success).toBe(true)
      expect(result.current.isConnected).toBe(false)
    })
  })

  describe('sendTestMessage', () => {
    it('should send test message', async () => {
      const mockResponse = {
        success: true,
        message: 'Message sent successfully',
        data: { messageId: 'msg-123' }
      }

      mockWhatsappApi.sendTestMessage.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useWhatsAppStore())

      let sendResult: any
      await act(async () => {
        sendResult = await result.current.sendTestMessage('1234567890', 'Test message')
      })

      expect(mockWhatsappApi.sendTestMessage).toHaveBeenCalledWith({
        phoneNumber: '1234567890',
        message: 'Test message'
      })
      expect(sendResult.success).toBe(true)
    })
  })

  describe('polling', () => {
    it('should start and stop connection polling', () => {
      const { result } = renderHook(() => useWhatsAppStore())

      act(() => {
        result.current.startConnectionPolling()
      })

      expect(result.current.pollingInterval).toBeDefined()

      act(() => {
        result.current.stopConnectionPolling()
      })

      expect(result.current.pollingInterval).toBeNull()
    })
  })
})
