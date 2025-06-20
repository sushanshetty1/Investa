'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { 
    Package, Eye, EyeOff, User, Building, MapPin,
    Users, ArrowRight, ChevronLeft, CheckCircle, 
    Briefcase, Shield, Zap, Star, Target, 
    AlertCircle, Globe
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function CompanySignUpPage() {
    // State variables
    const [companyName, setCompanyName] = useState('')
    const [companyDisplayName, setCompanyDisplayName] = useState('')
    const [companyDescription, setCompanyDescription] = useState('')
    const [companyWebsite, setCompanyWebsite] = useState('')
    const [industry, setIndustry] = useState('')
    const [companySize, setCompanySize] = useState('SMALL')
    const [businessType, setBusinessType] = useState('PRIVATE')
    
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [jobTitle, setJobTitle] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    
    const [companyEmail, setCompanyEmail] = useState('')
    const [companyPhone, setCompanyPhone] = useState('')
    const [street, setStreet] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [country, setCountry] = useState('')
    const [zipCode, setZipCode] = useState('')
    
    const [registrationNumber, setRegistrationNumber] = useState('')
    const [taxId, setTaxId] = useState('')
    const [vatNumber, setVatNumber] = useState('')
    
    const [timezone, setTimezone] = useState('UTC')
    const [language, setLanguage] = useState('en')
    
    const [currentStep, setCurrentStep] = useState(1)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    
    const { signUp, checkUserAccess } = useAuth()
    const router = useRouter()

    // Configuration arrays
    const industries = [
        { value: 'retail', label: '🛍️ Retail', desc: 'Online and offline retail businesses' },
        { value: 'manufacturing', label: '🏭 Manufacturing', desc: 'Production and assembly operations' },
        { value: 'wholesale', label: '📦 Wholesale', desc: 'Bulk distribution and resale' },
        { value: 'logistics', label: '🚛 Logistics & Transportation', desc: 'Shipping and supply chain' },
        { value: 'healthcare', label: '🏥 Healthcare', desc: 'Medical and pharmaceutical supplies' },
        { value: 'food-beverage', label: '🍕 Food & Beverage', desc: 'Restaurant and food industry' },
        { value: 'automotive', label: '🚗 Automotive', desc: 'Vehicle parts and accessories' },
        { value: 'electronics', label: '💻 Electronics', desc: 'Tech and electronic components' },
        { value: 'fashion', label: '👕 Fashion & Apparel', desc: 'Clothing and accessories' },
        { value: 'construction', label: '🏗️ Construction', desc: 'Building materials and tools' },
        { value: 'pharmaceutical', label: '💊 Pharmaceutical', desc: 'Medical and health products' },
        { value: 'other', label: '🏢 Other', desc: 'Other business types' }
    ]

    const companySizes = [
        { 
            value: 'SMALL',
            label: 'Small Business',
            range: '1-50 employees',
            icon: <Building className="h-4 w-4" />,
            features: ['Basic inventory tracking', 'Simple reporting', 'Email support']
        },
        { 
            value: 'MEDIUM',
            label: 'Medium Company',
            range: '51-200 employees',
            icon: <Users className="h-4 w-4" />,
            features: ['Advanced analytics', 'Multi-location support', 'Priority support']
        },
        { 
            value: 'LARGE',
            label: 'Large Enterprise',
            range: '201-1000 employees',
            icon: <Briefcase className="h-4 w-4" />,
            features: ['Custom workflows', 'API access', 'Dedicated account manager']
        },
        { 
            value: 'ENTERPRISE',
            label: 'Enterprise',
            range: '1000+ employees',
            icon: <Target className="h-4 w-4" />,
            features: ['White-label options', 'Custom integrations', '24/7 phone support']
        }
    ]

    const businessTypes = [
        { value: 'PRIVATE', label: 'Private Company', icon: <Building className="h-4 w-4" /> },
        { value: 'PUBLIC', label: 'Public Company', icon: <Globe className="h-4 w-4" /> },
        { value: 'LLC', label: 'Limited Liability Company (LLC)', icon: <Shield className="h-4 w-4" /> },
        { value: 'PARTNERSHIP', label: 'Partnership', icon: <Users className="h-4 w-4" /> },
        { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietorship', icon: <User className="h-4 w-4" /> },
        { value: 'NON_PROFIT', label: 'Non-Profit Organization', icon: <Star className="h-4 w-4" /> }
    ]

    const timezones = [
        { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
        { value: 'America/New_York', label: 'Eastern Time (US)' },
        { value: 'America/Chicago', label: 'Central Time (US)' },
        { value: 'America/Denver', label: 'Mountain Time (US)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
        { value: 'Europe/London', label: 'London (GMT)' },
        { value: 'Europe/Paris', label: 'Paris (CET)' },
        { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
        { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
        { value: 'Australia/Sydney', label: 'Sydney (AEST)' }
    ]

    const stepConfig = [
        {
            title: 'Company Info',
            subtitle: 'Tell us about your business',
            icon: <Building className="h-5 w-5" />,
            description: 'Basic information about your company'
        },
        {
            title: 'Admin Account',
            subtitle: 'Create your admin account',
            icon: <User className="h-5 w-5" />,
            description: 'Your personal account details as company admin'
        },
        {
            title: 'Contact Details',
            subtitle: 'Company contact information',
            icon: <MapPin className="h-5 w-5" />,
            description: 'How customers and partners can reach you'
        },
        {
            title: 'Review & Launch',
            subtitle: 'Finalize your setup',
            icon: <CheckCircle className="h-5 w-5" />,
            description: 'Review and confirm your company details'
        }
    ]

    // Handler functions
    const handleNextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(companyName && industry && companySize && businessType)
            case 2:
                return !!(firstName && lastName && email && password && confirmPassword && jobTitle)
            case 3:
                return !!(companyEmail && street && city && country)
            case 4:
                return true
            default:
                return false        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long')
            setLoading(false)
            return
        }

        try {
            // 1. Create user account with Supabase Auth
            const { data: authData, error: authError } = await signUp(email, password)
            
            if (authError) {
                setError(authError.message)
                setLoading(false)
                return
            }

            if (!authData.user) {
                setError('Failed to create user account')
                setLoading(false)
                return
            }

            // 2. Create company and user records via API
            const companyAddress = {
                street: street.trim(),
                city: city.trim(),
                state: state.trim(),
                country: country.trim(),
                zipCode: zipCode.trim()
            }

            const response = await fetch('/api/auth/company-signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: authData.user.id,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email,
                    phone: phone.trim() || null,
                    jobTitle: jobTitle.trim(),
                    timezone: timezone,
                    language: language,
                    companyName: companyName.trim(),
                    companyDisplayName: companyDisplayName.trim() || companyName.trim(),
                    companyDescription: companyDescription.trim() || null,
                    companyWebsite: companyWebsite.trim() || null,
                    industry: industry,
                    companySize: companySize,
                    businessType: businessType,
                    companyEmail: companyEmail.trim(),
                    companyPhone: companyPhone.trim() || null,
                    address: companyAddress,
                    registrationNumber: registrationNumber.trim() || null,
                    taxId: taxId.trim() || null,
                    vatNumber: vatNumber.trim() || null,
                }),
            })

            const result = await response.json()
            
            if (!result.success) {
                setError('Failed to create company: ' + result.error)
                setLoading(false)
                return
            }            setMessage('Company registration successful! Redirecting to dashboard...')
            
            // Wait a moment for database consistency, then refresh user access check
            await new Promise(resolve => setTimeout(resolve, 1000));
            await checkUserAccess(0);
            
            // Additional delay to ensure access check completes
            setTimeout(() => {
                router.push('/dashboard')
            }, 1500)

        } catch (err: any) {
            setError('An unexpected error occurred: ' + (err?.message || 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <Building className="h-12 w-12 text-blue-600 mx-auto" />
                            <h2 className="text-2xl font-bold">Company Information</h2>
                            <p className="text-muted-foreground">Tell us about your business to get started</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName" className="text-sm font-medium flex items-center">
                                        Company Name <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="companyName"
                                        type="text"
                                        placeholder="e.g., Acme Corporation"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="h-11"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="companyDisplayName" className="text-sm font-medium">Display Name</Label>
                                    <Input
                                        id="companyDisplayName"
                                        type="text"
                                        placeholder="e.g., Acme Corp (optional)"
                                        value={companyDisplayName}
                                        onChange={(e) => setCompanyDisplayName(e.target.value)}
                                        className="h-11"
                                    />
                                    <p className="text-xs text-muted-foreground">How your company name appears to users</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="companyWebsite" className="text-sm font-medium">Website</Label>
                                    <Input
                                        id="companyWebsite"
                                        type="url"
                                        placeholder="https://www.example.com"
                                        value={companyWebsite}
                                        onChange={(e) => setCompanyWebsite(e.target.value)}
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="industry" className="text-sm font-medium flex items-center">
                                        Industry <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Select value={industry} onValueChange={setIndustry} required>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select your industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {industries.map((ind) => (
                                                <SelectItem key={ind.value} value={ind.value}>
                                                    <div className="flex flex-col">
                                                        <span>{ind.label}</span>
                                                        <span className="text-xs text-muted-foreground">{ind.desc}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Company Description</Label>
                                    <Textarea
                                        placeholder="Brief description of your business..."
                                        value={companyDescription}
                                        onChange={(e) => setCompanyDescription(e.target.value)}
                                        rows={3}
                                        className="resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-sm font-medium flex items-center">
                                Company Size <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {companySizes.map((size) => (
                                    <Card 
                                        key={size.value} 
                                        className={`cursor-pointer transition-all hover:shadow-md ${
                                            companySize === size.value 
                                                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                                                : 'hover:ring-1 hover:ring-gray-300'
                                        }`}
                                        onClick={() => setCompanySize(size.value)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                {size.icon}
                                                <h3 className="font-medium text-sm">{size.label}</h3>
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-2">{size.range}</p>
                                            <ul className="space-y-1">
                                                {size.features.map((feature, idx) => (
                                                    <li key={idx} className="text-xs text-muted-foreground flex items-center">
                                                        <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-sm font-medium flex items-center">
                                Business Type <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {businessTypes.map((type) => (
                                    <Card 
                                        key={type.value} 
                                        className={`cursor-pointer transition-all hover:shadow-md ${
                                            businessType === type.value 
                                                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                                                : 'hover:ring-1 hover:ring-gray-300'
                                        }`}
                                        onClick={() => setBusinessType(type.value)}
                                    >
                                        <CardContent className="p-4 flex items-center gap-3">
                                            {type.icon}
                                            <span className="font-medium text-sm">{type.label}</span>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <User className="h-12 w-12 text-blue-600 mx-auto" />
                            <h2 className="text-2xl font-bold">Admin Account</h2>
                            <p className="text-muted-foreground">Create your personal admin account</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-sm font-medium flex items-center">
                                        First Name <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="firstName"
                                        type="text"
                                        placeholder="John"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="h-11"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-sm font-medium flex items-center">
                                        Last Name <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="lastName"
                                        type="text"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="h-11"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium flex items-center">
                                        Email Address <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+1 (555) 123-4567"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="jobTitle" className="text-sm font-medium flex items-center">
                                        Job Title <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="jobTitle"
                                        type="text"
                                        placeholder="CEO, Founder, Manager, etc."
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        className="h-11"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium flex items-center">
                                        Password <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create a secure password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-11 pr-10"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1 h-9 w-9 p-0"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">At least 6 characters</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center">
                                        Confirm Password <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm your password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="h-11 pr-10"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1 h-9 w-9 p-0"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="timezone" className="text-sm font-medium">Timezone</Label>
                                        <Select value={timezone} onValueChange={setTimezone}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timezones.map((tz) => (
                                                    <SelectItem key={tz.value} value={tz.value}>
                                                        {tz.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                                        <Select value={language} onValueChange={setLanguage}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="es">Spanish</SelectItem>
                                                <SelectItem value="fr">French</SelectItem>
                                                <SelectItem value="de">German</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <MapPin className="h-12 w-12 text-blue-600 mx-auto" />
                            <h2 className="text-2xl font-bold">Contact Information</h2>
                            <p className="text-muted-foreground">How customers and partners can reach your company</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Company Contact
                                </h3>

                                <div className="space-y-2">
                                    <Label htmlFor="companyEmail" className="text-sm font-medium flex items-center">
                                        Company Email <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="companyEmail"
                                        type="email"
                                        placeholder="info@company.com"
                                        value={companyEmail}
                                        onChange={(e) => setCompanyEmail(e.target.value)}
                                        className="h-11"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="companyPhone" className="text-sm font-medium">Company Phone</Label>
                                    <Input
                                        id="companyPhone"
                                        type="tel"
                                        placeholder="+1 (555) 123-4567"
                                        value={companyPhone}
                                        onChange={(e) => setCompanyPhone(e.target.value)}
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium">Legal Information (Optional)</h4>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="registrationNumber" className="text-sm font-medium">Registration Number</Label>
                                        <Input
                                            id="registrationNumber"
                                            type="text"
                                            placeholder="Company registration number"
                                            value={registrationNumber}
                                            onChange={(e) => setRegistrationNumber(e.target.value)}
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="taxId" className="text-sm font-medium">Tax ID / EIN</Label>
                                        <Input
                                            id="taxId"
                                            type="text"
                                            placeholder="Federal tax identification"
                                            value={taxId}
                                            onChange={(e) => setTaxId(e.target.value)}
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="vatNumber" className="text-sm font-medium">VAT Number</Label>
                                        <Input
                                            id="vatNumber"
                                            type="text"
                                            placeholder="VAT registration number"
                                            value={vatNumber}
                                            onChange={(e) => setVatNumber(e.target.value)}
                                            className="h-11"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Business Address
                                </h3>

                                <div className="space-y-2">
                                    <Label htmlFor="street" className="text-sm font-medium flex items-center">
                                        Street Address <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="street"
                                        type="text"
                                        placeholder="123 Business Street"
                                        value={street}
                                        onChange={(e) => setStreet(e.target.value)}
                                        className="h-11"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-sm font-medium flex items-center">
                                            City <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Input
                                            id="city"
                                            type="text"
                                            placeholder="New York"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="h-11"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="state" className="text-sm font-medium">State/Province</Label>
                                        <Input
                                            id="state"
                                            type="text"
                                            placeholder="NY"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            className="h-11"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="country" className="text-sm font-medium flex items-center">
                                            Country <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Input
                                            id="country"
                                            type="text"
                                            placeholder="United States"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            className="h-11"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="zipCode" className="text-sm font-medium">ZIP/Postal Code</Label>
                                        <Input
                                            id="zipCode"
                                            type="text"
                                            placeholder="10001"
                                            value={zipCode}
                                            onChange={(e) => setZipCode(e.target.value)}
                                            className="h-11"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                            <h2 className="text-2xl font-bold">Review & Launch</h2>
                            <p className="text-muted-foreground">Review your information and create your company</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Company Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <span className="font-medium">Name:</span> {companyName}
                                    </div>
                                    {companyDisplayName && (
                                        <div>
                                            <span className="font-medium">Display Name:</span> {companyDisplayName}
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-medium">Industry:</span>{' '}
                                        {industries.find(i => i.value === industry)?.label || industry}
                                    </div>
                                    <div>
                                        <span className="font-medium">Size:</span>{' '}
                                        {companySizes.find(s => s.value === companySize)?.label || companySize}
                                    </div>
                                    <div>
                                        <span className="font-medium">Type:</span>{' '}
                                        {businessTypes.find(t => t.value === businessType)?.label || businessType}
                                    </div>
                                    {companyWebsite && (
                                        <div>
                                            <span className="font-medium">Website:</span>{' '}
                                            <a href={companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                {companyWebsite}
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Admin Account
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <span className="font-medium">Name:</span> {firstName} {lastName}
                                    </div>
                                    <div>
                                        <span className="font-medium">Email:</span> {email}
                                    </div>
                                    <div>
                                        <span className="font-medium">Title:</span> {jobTitle}
                                    </div>
                                    {phone && (
                                        <div>
                                            <span className="font-medium">Phone:</span> {phone}
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-medium">Timezone:</span>{' '}
                                        {timezones.find(tz => tz.value === timezone)?.label || timezone}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <span className="font-medium">Email:</span> {companyEmail}
                                    </div>
                                    {companyPhone && (
                                        <div>
                                            <span className="font-medium">Phone:</span> {companyPhone}
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-medium">Address:</span>
                                        <div className="text-sm text-muted-foreground ml-2">
                                            {street}<br />
                                            {city}{state && `, ${state}`} {zipCode}<br />
                                            {country}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5" />
                                        What&apos;s Next?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        <span className="text-sm">Email verification link will be sent</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        <span className="text-sm">Complete company setup wizard</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        <span className="text-sm">Invite team members</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        <span className="text-sm">Start managing inventory</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
            {/* Header */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                        <Package className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">Invista</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Already have an account?</span>
                        <Button variant="outline" asChild>
                            <Link href="/auth/login">Sign In</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="container mx-auto px-4 mb-8">
                <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-4">
                        {stepConfig.map((step, index) => {
                            const stepNumber = index + 1
                            const isActive = currentStep === stepNumber
                            const isCompleted = currentStep > stepNumber
                            
                            return (
                                <div key={stepNumber} className="flex items-center">
                                    <div className={`
                                        flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                                        ${isCompleted 
                                            ? 'bg-green-500 border-green-500 text-white' 
                                            : isActive 
                                                ? 'bg-blue-500 border-blue-500 text-white' 
                                                : 'bg-white border-gray-300 text-gray-500'
                                        }
                                    `}>
                                        {isCompleted ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : (
                                            step.icon
                                        )}
                                    </div>
                                    <div className="ml-3 hidden md:block">
                                        <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                                            {step.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {step.subtitle}
                                        </div>
                                    </div>
                                    {stepNumber < stepConfig.length && (
                                        <ArrowRight className="mx-4 h-4 w-4 text-gray-400" />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 pb-12">
                <Card className="max-w-6xl mx-auto shadow-xl">
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit}>
                            {renderStepContent()}

                            {/* Error/Success Messages */}
                            {error && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                                    <div className="flex items-center">
                                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                                        <span className="text-red-800">{error}</span>
                                    </div>
                                </div>
                            )}

                            {message && (
                                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                                    <div className="flex items-center">
                                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                        <span className="text-green-800">{message}</span>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePrevStep}
                                    disabled={currentStep === 1}
                                    className="flex items-center gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>

                                {currentStep < 4 ? (
                                    <Button
                                        type="button"
                                        onClick={handleNextStep}
                                        disabled={!validateStep(currentStep)}
                                        className="flex items-center gap-2"
                                    >
                                        Next
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={loading || !validateStep(currentStep)}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                Creating Company...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="h-4 w-4" />
                                                Create Company
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
