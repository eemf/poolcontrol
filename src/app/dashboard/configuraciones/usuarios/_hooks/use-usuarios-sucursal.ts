'use client'

import { useState, useEffect, useMemo, useCallback, FormEvent } from "react"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, query, writeBatch, orderBy } from "firebase/firestore"
import { initializeApp, deleteApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth"
import { firebaseConfig } from "@/firebase/config"
import { useToast } from "@/hooks/use-toast"
import { useSucursal } from "@/hooks/use-sucursal"
import { cambiarPasswordUsuario } from "@/lib/firebase/servicios/usuarios-auth"
import type { UsuarioSucursal, Rol } from "@/lib/tipos"

export type UsuarioConDocId = UsuarioSucursal & { docId: string }

export function useUsuariosSucursal() {
  const { auth, firestore } = useFirebase()
  const { user: currentUser, isUserLoading } = useUser()
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal()
  const { toast } = useToast()

  // Estados de UI
  const [isMounted, setIsMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("name-asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Estados de datos
  const [editingUser, setEditingUser] = useState<UsuarioConDocId | null>(null)
  const [userToDelete, setUserToDelete] = useState<UsuarioConDocId | null>(null)
  const [usuarioParaPassword, setUsuarioParaPassword] = useState<UsuarioConDocId | null>(null)
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false)

  // Estados del formulario
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('')

  // Consultas Firestore
  const usuariosQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null
    return query(collection(firestore, `sucursales/${sucursalId}/usuarios`), orderBy("nombre", "asc"))
  }, [firestore, sucursalId])

  const rolesQuery = useMemoFirebase(() => {
    if (!firestore || !sucursalId) return null
    return query(collection(firestore, `sucursales/${sucursalId}/roles`), orderBy("nombre", "asc"))
  }, [firestore, sucursalId])

  const { data: rawUsuarios, isLoading: isLoadingUsuarios, error: errorUsuarios } = useCollection<UsuarioSucursal>(usuariosQuery)
  const { data: roles, isLoading: isLoadingRoles } = useCollection<Rol>(rolesQuery)

  const resetForm = useCallback(() => {
    setNombre('')
    setEmail('')
    setPassword('')
    setRol('')
    setEditingUser(null)
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (editingUser) {
      setNombre(editingUser.nombre)
      setEmail(editingUser.email)
      const initialRolId = editingUser.roles && editingUser.roles.length > 0
        ? editingUser.roles[0]
        : (roles?.find(r => r.nombre === editingUser.rol) as any)?.id || ''

      setRol(initialRolId)
      setPassword('')
    } else {
      resetForm()
    }
  }, [editingUser, resetForm, roles])

  const usuariosConDocId = useMemo((): UsuarioConDocId[] => {
    return (rawUsuarios || []).map((u) => ({ ...u, docId: u.authUid } as UsuarioConDocId))
  }, [rawUsuarios])

  const filteredUsuarios = useMemo(() => {
    const term = searchTerm.toLowerCase()
    const filtered = usuariosConDocId.filter(u =>
      (u.nombre || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.rol || '').toLowerCase().includes(term)
    )
    return filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'name-desc':
          return (b.nombre || '').localeCompare(a.nombre || '')
        case 'rol-asc':
          return (a.rol || '').localeCompare(b.rol || '') || (a.nombre || '').localeCompare(b.nombre || '')
        case 'name-asc':
        default:
          return (a.nombre || '').localeCompare(b.nombre || '')
      }
    })
  }, [usuariosConDocId, searchTerm, sortOrder])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortOrder])

  const paginatedUsuarios = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredUsuarios.slice(start, start + itemsPerPage)
  }, [filteredUsuarios, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage) || 1

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!firestore || !sucursalId || !nombre || !email || !rol || (!editingUser && !password)) {
      toast({ title: "Error", description: "Todos los campos son obligatorios.", variant: "destructive" })
      return
    }
    if (!editingUser && password.length < 6) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" })
      return
    }
    setLoading(true)

    try {
      let finalAuthUid = ''

      if (editingUser) {
        finalAuthUid = editingUser.authUid
      } else {
        const secondaryApp = initializeApp(firebaseConfig, 'SecondaryUserCreation')
        const secondaryAuth = getAuth(secondaryApp)

        try {
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password)
          finalAuthUid = userCredential.user.uid
          await firebaseSignOut(secondaryAuth)
        } finally {
          await deleteApp(secondaryApp)
        }
      }

      const batch = writeBatch(firestore)
      const selectedRole = roles?.find(r => (r as any).id === rol)
      const roleName = selectedRole?.nombre || 'Sin Rol'

      if (editingUser) {
        const userInSucursalRef = doc(firestore, 'sucursales', sucursalId, 'usuarios', editingUser.authUid)
        const userAuthLookupRef = doc(firestore, 'user_auth_lookup', editingUser.authUid)

        const dataToUpdate = {
          nombre,
          rol: roleName,
          roles: [rol]
        }
        batch.update(userInSucursalRef, dataToUpdate)
        batch.update(userAuthLookupRef, { nombre, rol: roleName, sucursalId })

        if (password.trim()) {
          if (password.length < 6) {
            toast({ title: "Error", description: "La nueva contraseña debe tener al menos 6 caracteres.", variant: "destructive" })
            setLoading(false)
            return
          }
          const resPassword = await cambiarPasswordUsuario({
            authUid: editingUser.authUid,
            email: editingUser.email,
            nuevaPassword: password,
            currentUser,
            auth,
          })
          if (!resPassword.ok) {
            toast({
              variant: "destructive",
              title: "Aviso de contraseña",
              description: resPassword.message,
            })
          } else {
            toast({
              title: "Contraseña actualizada",
              description: `Se actualizó la contraseña para ${editingUser.nombre}.`,
            })
          }
        }
      } else {
        const userInSucursalRef = doc(firestore, 'sucursales', sucursalId, 'usuarios', finalAuthUid)
        const userAuthLookupRef = doc(firestore, 'user_auth_lookup', finalAuthUid)

        const finalData = {
          authUid: finalAuthUid,
          nombre,
          email,
          rol: roleName,
          sucursalId: sucursalId,
          roles: [rol]
        }
        const lookupData = { nombre, email, rol: roleName, sucursalId: sucursalId }

        batch.set(userInSucursalRef, finalData)
        batch.set(userAuthLookupRef, lookupData)
      }

      await batch.commit()
      toast({ title: "Éxito", description: `Usuario ${editingUser ? 'actualizado' : 'creado'} correctamente.` })
      setIsModalOpen(false)
      resetForm()
    } catch (error: any) {
      console.error("Error guardando usuario:", error)
      if (error.code === 'auth/email-already-in-use') {
        toast({
          variant: "destructive",
          title: "Correo ya registrado",
          description: "Este email ya existe en la base de datos global. Contacta al Administrador Maestro.",
        })
      } else {
        toast({ title: "Error", description: error.message || "No se pudo guardar el usuario.", variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!firestore || !userToDelete || !sucursalId) return
    setLoading(true)
    try {
      const batch = writeBatch(firestore)
      const userInSucursalRef = doc(firestore, 'sucursales', sucursalId, 'usuarios', userToDelete.authUid)
      const userAuthLookupRef = doc(firestore, 'user_auth_lookup', userToDelete.authUid)

      batch.delete(userInSucursalRef)
      batch.delete(userAuthLookupRef)

      await batch.commit()
      toast({ title: "Éxito", description: "Usuario eliminado de la sucursal." })
      setUserToDelete(null)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const cargando = isLoadingUsuarios || isUserLoading || isLoadingSucursal
  const errorPermisos = !!(errorUsuarios && errorUsuarios.message.includes("Missing or insufficient permissions"))

  return {
    isMounted,
    cargando,
    errorPermisos,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    totalItems: filteredUsuarios.length,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedUsuarios,
    isModalOpen,
    setIsModalOpen,
    editingUser,
    setEditingUser,
    userToDelete,
    setUserToDelete,
    usuarioParaPassword,
    setUsuarioParaPassword,
    modalPasswordOpen,
    setModalPasswordOpen,
    loading,
    roles,
    form: {
      nombre, setNombre,
      email, setEmail,
      rol, setRol,
      password, setPassword,
    },
    resetForm,
    handleSubmit,
    handleDelete,
  }
}
