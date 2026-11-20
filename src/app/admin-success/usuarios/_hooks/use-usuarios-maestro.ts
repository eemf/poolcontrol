'use client'

import { useState, useEffect, useMemo, FormEvent } from "react"
import { useFirebase, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, query, orderBy, writeBatch } from "firebase/firestore"
import { initializeApp, deleteApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth"
import { firebaseConfig } from "@/firebase/config"
import { useToast } from "@/hooks/use-toast"
import { cambiarPasswordUsuario } from "@/lib/firebase/servicios/usuarios-auth"

export type UsuarioMaestro = {
  authUid: string
  nombre: string
  email: string
  rol: string
  sucursalId: string
  roles?: string[]
  accesoGlobal?: boolean
  sucursalesPermitidas?: string[]
}

export type RolMaestro = {
  idRol: number
  nombre: string
  descripcion?: string
}

export type SucursalMaestro = {
  id: string
  idSucursal: number
  nombre: string
}

export type UsuarioConDocId = UsuarioMaestro & { docId: string }

export function useUsuariosMaestro() {
  const [isMounted, setIsMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UsuarioConDocId | null>(null)
  const [editingUser, setEditingUser] = useState<UsuarioConDocId | null>(null)
  const [usuarioParaPassword, setUsuarioParaPassword] = useState<UsuarioConDocId | null>(null)
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [filtroAcceso, setFiltroAcceso] = useState<'todos' | 'global' | 'base'>('todos')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const { auth, firestore } = useFirebase()
  const { user: currentUser, isUserLoading } = useUser()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('')
  const [accesoGlobal, setAccesoGlobal] = useState(false)
  const [sucursalesPermitidas, setSucursalesPermitidas] = useState<string[]>([])
  const [selectedSucursalId, setSelectedSucursalId] = useState('')

  const sucursalesQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return query(collection(firestore, 'sucursales'), orderBy("nombre", "asc"))
  }, [firestore])

  const usuariosQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser || !selectedSucursalId) return null
    return query(collection(firestore, `sucursales/${selectedSucursalId}/usuarios`), orderBy("nombre", "asc"))
  }, [firestore, currentUser, selectedSucursalId])

  const rolesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedSucursalId) return null
    return query(collection(firestore, `sucursales/${selectedSucursalId}/roles`), orderBy("nombre", "asc"))
  }, [firestore, selectedSucursalId])

  const { data: usuarios, isLoading: isLoadingUsuarios } = useCollection<UsuarioMaestro>(usuariosQuery)
  const { data: sucursales, isLoading: isLoadingSucursales } = useCollection<SucursalMaestro>(sucursalesQuery)
  const { data: roles, isLoading: isLoadingRoles } = useCollection<RolMaestro>(rolesQuery)

  const selectedSucursalNombre = useMemo(() => {
    return sucursales?.find(s => s.id === selectedSucursalId)?.nombre || ''
  }, [sucursales, selectedSucursalId])

  useEffect(() => {
    if (sucursales && sucursales.length > 0) {
      setSelectedSucursalId(prev => prev || sucursales[0].id)
    }
  }, [sucursales])

  const resetForm = () => {
    setNombre('')
    setEmail('')
    setPassword('')
    setRol('')
    setAccesoGlobal(false)
    setSucursalesPermitidas([])
    setEditingUser(null)
  }

  useEffect(() => {
    if (editingUser) {
      setNombre(editingUser.nombre || '')
      setEmail(editingUser.email || '')
      setAccesoGlobal(editingUser.accesoGlobal || false)
      if (editingUser.sucursalesPermitidas && editingUser.sucursalesPermitidas.length > 0) {
        setSucursalesPermitidas(editingUser.sucursalesPermitidas)
      } else if (editingUser.accesoGlobal) {
        setSucursalesPermitidas((sucursales || []).map(s => s.id))
      } else {
        setSucursalesPermitidas(selectedSucursalId ? [selectedSucursalId] : [])
      }
      const initialRolId = editingUser.roles && editingUser.roles.length > 0
        ? editingUser.roles[0]
        : (roles?.find(r => r.nombre === editingUser.rol) as any)?.id || ''
      setRol(initialRolId)
      setPassword('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingUser])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleOpenModal = (user: UsuarioConDocId | null) => {
    if (user) {
      setEditingUser(user)
    } else {
      resetForm()
      if (selectedSucursalId) {
        setSucursalesPermitidas([selectedSucursalId])
      }
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!firestore || !currentUser || !nombre || !email || !rol || !selectedSucursalId || (!editingUser && !password)) {
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
        const secondaryApp = initializeApp(firebaseConfig, 'SecondaryAdminCreation')
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

      const finalSucursalesPermitidas = accesoGlobal
        ? Array.from(new Set([...(sucursalesPermitidas.length > 0 ? sucursalesPermitidas : (sucursales || []).map(s => s.id)), selectedSucursalId]))
        : []

      if (editingUser) {
        const userInSucursalRef = doc(firestore, 'sucursales', selectedSucursalId, 'usuarios', editingUser.authUid)
        const userAuthLookupRef = doc(firestore, 'user_auth_lookup', editingUser.authUid)

        const dataToUpdate = {
          nombre,
          rol: roleName,
          roles: [rol],
          accesoGlobal,
          sucursalesPermitidas: finalSucursalesPermitidas,
        }
        batch.update(userInSucursalRef, dataToUpdate)
        batch.update(userAuthLookupRef, {
          nombre,
          rol: roleName,
          sucursalId: selectedSucursalId,
          accesoGlobal,
          sucursalesPermitidas: finalSucursalesPermitidas,
        })

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
            toast({ variant: "destructive", title: "Aviso de contraseña", description: resPassword.message })
          } else {
            toast({ title: "Contraseña actualizada", description: `Se actualizó la contraseña para ${editingUser.nombre}.` })
          }
        }
      } else {
        const userInSucursalRef = doc(firestore, 'sucursales', selectedSucursalId, 'usuarios', finalAuthUid)
        const userAuthLookupRef = doc(firestore, 'user_auth_lookup', finalAuthUid)

        batch.set(userInSucursalRef, {
          authUid: finalAuthUid,
          nombre,
          email,
          rol: roleName,
          sucursalId: selectedSucursalId,
          roles: [rol],
          accesoGlobal,
          sucursalesPermitidas: finalSucursalesPermitidas,
        })
        batch.set(userAuthLookupRef, {
          nombre,
          email,
          rol: roleName,
          sucursalId: selectedSucursalId,
          accesoGlobal,
          sucursalesPermitidas: finalSucursalesPermitidas,
        })
      }

      await batch.commit()
      toast({ title: "Éxito", description: `Usuario ${editingUser ? 'actualizado' : 'creado'} correctamente.` })
      handleCloseModal()
    } catch (error: any) {
      console.error("Error guardando usuario:", error)
      if (error.code === 'auth/email-already-in-use') {
        toast({ variant: "destructive", title: "Error", description: "Este correo ya está en uso globalmente." })
      } else {
        toast({ title: "Error", description: error.message || "No se pudo guardar el usuario.", variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!firestore || !userToDelete) return
    setLoading(true)

    const batch = writeBatch(firestore)
    const userInSucursalRef = doc(firestore, 'sucursales', userToDelete.sucursalId, 'usuarios', userToDelete.authUid)
    const userAuthLookupRef = doc(firestore, 'user_auth_lookup', userToDelete.authUid)

    batch.delete(userInSucursalRef)
    batch.delete(userAuthLookupRef)

    try {
      await batch.commit()
      toast({ title: "Éxito", description: "Usuario eliminado del sistema." })
    } catch (error: any) {
      console.error("Error eliminando usuario:", error)
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
      setUserToDelete(null)
    }
  }

  const usuariosConDocId = useMemo((): UsuarioConDocId[] => {
    return (usuarios || []).map((u) => ({
      ...u,
      docId: u.authUid,
    }))
  }, [usuarios])

  const conteos = useMemo(() => ({
    todos: usuariosConDocId.length,
    global: usuariosConDocId.filter((u) => u.accesoGlobal).length,
    base: usuariosConDocId.filter((u) => !u.accesoGlobal).length,
  }), [usuariosConDocId])

  const filteredUsuarios = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return usuariosConDocId.filter((u) => {
      if (filtroAcceso === 'global' && !u.accesoGlobal) return false
      if (filtroAcceso === 'base' && u.accesoGlobal) return false
      if (!term) return true
      return (
        (u.nombre || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term) ||
        (u.rol || '').toLowerCase().includes(term)
      )
    })
  }, [usuariosConDocId, searchTerm, filtroAcceso])

  return {
    isMounted,
    isLoading: isUserLoading || isLoadingSucursales || isLoadingUsuarios,
    isLoadingSucursales,
    isLoadingRoles,
    sucursales: sucursales || [],
    roles: roles || [],
    selectedSucursalId,
    setSelectedSucursalId,
    selectedSucursalNombre,
    filteredUsuarios,
    conteos,
    searchTerm,
    setSearchTerm,
    filtroAcceso,
    setFiltroAcceso,
    isModalOpen,
    editingUser,
    userToDelete,
    setUserToDelete,
    usuarioParaPassword,
    setUsuarioParaPassword,
    modalPasswordOpen,
    setModalPasswordOpen,
    loading,
    form: {
      nombre, setNombre,
      email, setEmail,
      password, setPassword,
      rol, setRol,
      accesoGlobal, setAccesoGlobal,
      sucursalesPermitidas, setSucursalesPermitidas,
    },
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDeleteUser,
  }
}

