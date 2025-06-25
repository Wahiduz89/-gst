// src/app/api/business/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { userService } from '@/lib/db-service';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessInfo = await userService.getBusinessInfo(session.user.id);
    return NextResponse.json(businessInfo);
  } catch (error) {
    console.error('Business GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business information' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const updated = await userService.updateBusinessInfo(session.user.id, data);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Business PUT error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update business information' },
      { status: 400 }
    );
  }
}

// src/app/api/business/logo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { userService } from '@/lib/db-service';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPG, PNG, GIF or WebP' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const updated = await userService.uploadBusinessLogo(session.user.id, buffer);
    
    return NextResponse.json({ 
      success: true, 
      logoUrl: updated.businessLogo 
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    );
  }
}

// src/app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { customerService } from '@/lib/db-service';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customers = await customerService.getCustomers(session.user.id);
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Customers GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const customer = await customerService.createCustomer(session.user.id, data);
    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Customer POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create customer' },
      { status: 400 }
    );
  }
}

// src/app/api/customers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { customerService } from '@/lib/db-service';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const updated = await customerService.updateCustomer(
      params.id,
      session.user.id,
      data
    );
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Customer PUT error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update customer' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await customerService.deleteCustomer(params.id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Customer DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete customer' },
      { status: 400 }
    );
  }
}

// src/app/api/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { invoiceService } from '@/lib/db-service';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const options = {
      status: searchParams.get('status') || undefined,
      paymentStatus: searchParams.get('paymentStatus') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    const result = await invoiceService.getInvoices(session.user.id, options);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Invoices GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const invoice = await invoiceService.createInvoice(session.user.id, data);
    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('Invoice POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create invoice' },
      { status: 400 }
    );
  }
}

// src/app/api/invoices/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { invoiceService } from '@/lib/db-service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoice = await invoiceService.getInvoiceById(params.id, session.user.id);
    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('Invoice GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoice' },
      { status: 404 }
    );
  }
}

// src/app/api/invoices/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { invoiceService } from '@/lib/db-service';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();
    const updated = await invoiceService.updateInvoiceStatus(
      params.id,
      session.user.id,
      status
    );
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Invoice status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update invoice status' },
      { status: 400 }
    );
  }
}

// src/app/api/invoices/[id]/payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { invoiceService } from '@/lib/db-service';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const updated = await invoiceService.updatePaymentStatus(
      params.id,
      session.user.id,
      data
    );
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update payment status' },
      { status: 400 }
    );
  }
}