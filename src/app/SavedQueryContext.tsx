import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { SavedQuery, SavedQueryExecutionResult, SavedQueryListResponse } from './types'
import { savedQueriesApi, CreateSavedQueryPayload, UpdateSavedQueryPayload, ListSavedQueriesParams } from '../api/savedQueries'

interface SavedQueryContextState {
  queries: SavedQuery[]
  total: number
  isLoading: boolean
  error: string | null
  
  loadQueries: (params: ListSavedQueriesParams) => Promise<void>
  getById: (id: string) => Promise<SavedQuery | null>
  create: (payload: CreateSavedQueryPayload) => Promise<SavedQuery>
  update: (id: string, payload: UpdateSavedQueryPayload) => Promise<SavedQuery>
  deleteQuery: (id: string) => Promise<void>
  execute: (id: string) => Promise<SavedQueryExecutionResult>
  favorite: (id: string, is_favorite: boolean) => Promise<SavedQuery>
  pin: (id: string, is_pinned: boolean) => Promise<SavedQuery>
}

const SavedQueryContext = createContext<SavedQueryContextState | undefined>(undefined)

export function SavedQueryProvider({ children }: { children: ReactNode }) {
  const [queries, setQueries] = useState<SavedQuery[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadQueries = useCallback(async (params: ListSavedQueriesParams) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await savedQueriesApi.list(params)
      setQueries(response.data)
      setTotal(response.total)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load saved queries.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getById = useCallback(async (id: string) => {
    try {
      return await savedQueriesApi.getById(id)
    } catch (err) {
      console.error(err)
      return null
    }
  }, [])

  const create = useCallback(async (payload: CreateSavedQueryPayload) => {
    const newQuery = await savedQueriesApi.create(payload)
    setQueries(prev => [newQuery, ...prev])
    setTotal(prev => prev + 1)
    return newQuery
  }, [])

  const update = useCallback(async (id: string, payload: UpdateSavedQueryPayload) => {
    const updatedQuery = await savedQueriesApi.update(id, payload)
    setQueries(prev => prev.map(q => q.id === id ? updatedQuery : q))
    return updatedQuery
  }, [])

  const favorite = useCallback(async (id: string, is_favorite: boolean) => {
    const updatedQuery = await savedQueriesApi.favorite(id, is_favorite)
    setQueries(prev => prev.map(q => q.id === id ? updatedQuery : q))
    return updatedQuery
  }, [])

  const pin = useCallback(async (id: string, is_pinned: boolean) => {
    const updatedQuery = await savedQueriesApi.pin(id, is_pinned)
    setQueries(prev => prev.map(q => q.id === id ? updatedQuery : q))
    return updatedQuery
  }, [])

  const deleteQuery = useCallback(async (id: string) => {
    await savedQueriesApi.delete(id)
    setQueries(prev => prev.filter(q => q.id !== id))
    setTotal(prev => prev - 1)
  }, [])

  const execute = useCallback(async (id: string) => {
    // We do not modify internal state here because execution returns a transient payload (the result).
    // The consumer (page) will handle rendering it.
    // We update the run count optimistically in the list.
    const result = await savedQueriesApi.execute(id)
    if (!result.error) {
      setQueries(prev => prev.map(q => 
        q.id === id 
          ? { ...q, execution_count: q.execution_count + 1, last_executed: new Date().toISOString() } 
          : q
      ))
    }
    return result
  }, [])

  return (
    <SavedQueryContext.Provider
      value={{
        queries,
        total,
        isLoading,
        error,
        loadQueries,
        getById,
        create,
        update,
        deleteQuery,
        execute,
        favorite,
        pin
      }}
    >
      {children}
    </SavedQueryContext.Provider>
  )
}

export function useSavedQueries() {
  const context = useContext(SavedQueryContext)
  if (context === undefined) {
    throw new Error('useSavedQueries must be used within a SavedQueryProvider')
  }
  return context
}
